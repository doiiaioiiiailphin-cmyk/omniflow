import { DAGNode, DAGExecution, AgentType, TaskStatus, ExecutionStatus } from '../types'
import { generateId } from '../utils'
import { extractJson } from '../utils'

interface SubtaskDef {
  id: string
  agentType: AgentType
  task: string
  dependencies: string[]
}

export function buildDAG(orchestratorOutput: string, taskSummary: string): DAGExecution {
  const subtasks = extractJson<{ subtasks: SubtaskDef[] }>(orchestratorOutput)

  if (!subtasks || !subtasks.subtasks || subtasks.subtasks.length === 0) {
    // Fallback: create a simple linear DAG
    return {
      id: generateId(),
      nodes: [
        createNode('generator', taskSummary, generateId(), []),
      ],
      status: 'idle',
      startedAt: Date.now(),
    }
  }

  const nodes: DAGNode[] = subtasks.subtasks.map(st => {
    const validAgentType = validateAgentType(st.agentType)
    return createNode(validAgentType, st.task, st.id, st.dependencies || [])
  })

  return {
    id: generateId(),
    nodes,
    status: 'idle',
    startedAt: Date.now(),
  }
}

function createNode(agentType: AgentType, task: string, id: string, deps: string[]): DAGNode {
  return {
    id,
    agentType,
    task,
    input: '',
    status: 'pending',
    dependencies: deps,
    retryCount: 0,
    maxRetries: 2,
  }
}

function validateAgentType(type: string): AgentType {
  const valid: AgentType[] = ['orchestrator', 'retriever', 'summarizer', 'generator', 'verifier']
  return valid.includes(type as AgentType) ? (type as AgentType) : 'generator'
}

export function getReadyNodes(nodes: DAGNode[]): DAGNode[] {
  return nodes.filter(node => {
    if (node.status !== 'pending') return false
    return node.dependencies.every(depId => {
      const dep = nodes.find(n => n.id === depId)
      return dep && dep.status === 'completed'
    })
  })
}

export function getNodeResults(nodes: DAGNode[], nodeIds: string[]): string {
  return nodeIds
    .map(id => {
      const node = nodes.find(n => n.id === id)
      if (!node || !node.result) return ''
      return `【${node.agentType}】${node.task}\n${node.result.output}\n---`
    })
    .filter(Boolean)
    .join('\n\n')
}

export function allNodesCompleted(nodes: DAGNode[]): boolean {
  return nodes.every(n => n.status === 'completed' || n.status === 'skipped')
}

export function anyNodeFailed(nodes: DAGNode[]): boolean {
  return nodes.some(n => n.status === 'failed' && n.retryCount >= n.maxRetries)
}

export function resetNodesForRetry(nodes: DAGNode[], failedFrom: string): void {
  const startIndex = nodes.findIndex(n => n.id === failedFrom)
  if (startIndex === -1) return

  for (let i = startIndex; i < nodes.length; i++) {
    if (nodes[i].status === 'completed' || nodes[i].status === 'failed') {
      nodes[i].status = 'pending'
      nodes[i].retryCount = (nodes[i].retryCount || 0)
    }
  }
}
