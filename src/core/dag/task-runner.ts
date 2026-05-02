import { LLMConfig, DAGNode, DAGExecution, ExecutionStatus, AgentResult } from '../types'
import { runOrchestrator } from '../agents/orchestrator'
import { runRetriever } from '../agents/retriever'
import { runSummarizer } from '../agents/summarizer'
import { runGenerator } from '../agents/generator'
import { runVerifier } from '../agents/verifier'
import { buildDAG, getReadyNodes, getNodeResults, allNodesCompleted, anyNodeFailed, resetNodesForRetry } from './dag-builder'
import { extractJson } from '../utils'

export interface TaskProgressCallback {
  (execution: DAGExecution): void
}

export async function executeTask(
  config: LLMConfig,
  userTask: string,
  onProgress: TaskProgressCallback
): Promise<DAGExecution> {
  // Step 1: Orchestrator breaks down the task
  const orchResult = await runOrchestrator(config, userTask)
  const orchJson = extractJson<{ taskSummary: string }>(orchResult.output)
  const taskSummary = orchJson?.taskSummary || userTask

  // Step 2: Build DAG
  const execution = buildDAG(orchResult.output, taskSummary)
  execution.status = 'running'
  onProgress({ ...execution })

  const MAX_ITERATIONS = 3
  let iteration = 0

  while (iteration < MAX_ITERATIONS) {
    iteration++

    // Process all ready nodes
    let hasMore = true
    while (hasMore) {
      const ready = getReadyNodes(execution.nodes)
      if (ready.length === 0) break

      // Execute ready nodes in parallel
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
        return execution
      }
    }

    // Step 3: Check for verifier feedback loop
    const verifierNode = execution.nodes.find(n => n.agentType === 'verifier' && n.status === 'completed')
    if (verifierNode && verifierNode.result) {
      const verifyResult = extractJson<{ passed: boolean; score: number; issues: { severity: string; description: string; suggestion: string }[]; summary: string }>(verifierNode.result.output)

      if (verifyResult && verifyResult.passed === false && verifyResult.score < 6 && iteration < MAX_ITERATIONS) {
        // Find the generator node and re-run with feedback
        const generatorNode = execution.nodes.find(n => n.agentType === 'generator')
        if (generatorNode) {
          const feedback = verifyResult.issues.map(i => `[${i.severity}] ${i.description}\n建议：${i.suggestion}`).join('\n')
          
          resetNodesForRetry(execution.nodes, generatorNode.id)
          if (verifierNode) {
            verifierNode.status = 'pending'
          }
          
          // Update generator input with feedback
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

  return execution
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
