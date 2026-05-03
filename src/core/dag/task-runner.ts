import { LLMConfig, DAGNode, DAGExecution, AgentResult } from '../types'
import { classifyIntent, decomposeTask, synthesizeResponse } from '../agents/orchestrator'
import { runRetriever } from '../agents/retriever'
import { runSummarizer } from '../agents/summarizer'
import { runGenerator } from '../agents/generator'
import { runVerifier } from '../agents/verifier'
import { buildDAG, getReadyNodes, getNodeResults, allNodesCompleted, anyNodeFailed, resetNodesForRetry } from './dag-builder'
import { extractJson } from '../utils'

export interface TaskProgressCallback {
  (execution: DAGExecution): void
}

export interface TaskResult {
  type: 'chat' | 'task'
  response: string
  dag?: DAGExecution
}

export async function executeTask(
  config: LLMConfig,
  userTask: string,
  onProgress: TaskProgressCallback
): Promise<TaskResult> {
  // Phase 1: Classify intent
  const intent = await classifyIntent(config, userTask)

  if (intent.intent === 'chat') {
    return { type: 'chat', response: intent.response || '你好！有什么可以帮你的？' }
  }

  // Phase 2: Decompose task into DAG
  const orchResult = await decomposeTask(config, userTask)
  const orchJson = extractJson<{ taskSummary: string }>(orchResult.output)
  const taskSummary = orchJson?.taskSummary || userTask

  const execution = buildDAG(orchResult.output, taskSummary)
  execution.status = 'running'
  onProgress({ ...execution })

  // Phase 3: Execute DAG
  const MAX_ITERATIONS = 3
  let iteration = 0

  while (iteration < MAX_ITERATIONS) {
    iteration++

    let hasMore = true
    while (hasMore) {
      const ready = getReadyNodes(execution.nodes)
      if (ready.length === 0) break

      const results = await Promise.allSettled(
        ready.map(node => executeNode(config, node, execution, userTask))
      )

      results.forEach((result, i) => {
        const node = ready[i]
        if (result.status === 'fulfilled') {
          node.status = 'completed'
          node.result = result.value
        } else {
          node.retryCount++
          if (node.retryCount >= node.maxRetries) {
            node.status = 'failed'
          }
        }
      })

      onProgress({ ...execution })

      if (anyNodeFailed(execution.nodes)) {
        execution.status = 'failed'
        execution.completedAt = Date.now()
        return { type: 'task', response: '任务执行失败，部分 Agent 未能完成。', dag: execution }
      }
    }

    // Verifier feedback loop
    const verifierNode = execution.nodes.find(n => n.agentType === 'verifier' && n.status === 'completed')
    if (verifierNode && verifierNode.result) {
      const verifyResult = extractJson<{ passed: boolean; score: number; issues: { severity: string; description: string; suggestion: string }[]; summary: string }>(verifierNode.result.output)

      if (verifyResult && verifyResult.passed === false && verifyResult.score < 6 && iteration < MAX_ITERATIONS) {
        const generatorNode = execution.nodes.find(n => n.agentType === 'generator')
        if (generatorNode) {
          const feedback = verifyResult.issues.map(i => `[${i.severity}] ${i.description}\n建议：${i.suggestion}`).join('\n')

          resetNodesForRetry(execution.nodes, generatorNode.id)
          if (verifierNode) {
            verifierNode.status = 'pending'
          }

          generatorNode.input = feedback
          onProgress({ ...execution })
          continue
        }
      }
    }

    break
  }

  execution.status = allNodesCompleted(execution.nodes) ? 'completed' : 'failed'
  execution.completedAt = Date.now()
  onProgress({ ...execution })

  // Phase 4: Synthesize final response
  const agentResults = execution.nodes
    .filter(n => n.result)
    .map(n => `### [${n.agentType}] ${n.task}\n${n.result!.output}`)
    .join('\n\n---\n\n')

  const finalResponse = await synthesizeResponse(config, userTask, taskSummary, agentResults)

  return { type: 'task', response: finalResponse, dag: execution }
}

async function executeNode(
  config: LLMConfig,
  node: DAGNode,
  execution: DAGExecution,
  originalTask: string
): Promise<AgentResult> {
  node.status = 'running'

  const context = getNodeResults(execution.nodes, node.dependencies)

  switch (node.agentType) {
    case 'retriever':
      return runRetriever(config, node.task, context)
    case 'summarizer':
      return runSummarizer(config, node.task, context)
    case 'generator':
      return runGenerator(config, node.task, context, node.input)
    case 'verifier':
      return runVerifier(config, node.task, context, originalTask)
    default:
      return runGenerator(config, node.task, context)
  }
}
