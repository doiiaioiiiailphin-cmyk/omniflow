export interface LLMConfig {
  provider: string
  model: string
  apiKey: string
  baseUrl?: string
  temperature?: number
  maxTokens?: number
}

export interface AgentResult {
  agentType: AgentType
  output: string
  tokens: number
  duration: number
  metadata?: Record<string, unknown>
}

export interface DAGNode {
  id: string
  agentType: AgentType
  task: string
  input: string
  status: TaskStatus
  result?: AgentResult
  dependencies: string[]
  retryCount: number
  maxRetries: number
}

export interface DAGExecution {
  id: string
  nodes: DAGNode[]
  status: ExecutionStatus
  startedAt: number
  completedAt?: number
}

export interface SkillDef {
  name: string
  version: string
  description: string
  triggers: string[]
  agentType: AgentType
  systemPrompt: string
  tools?: string[]
  scripts?: string[]
  path: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'agent'
  content: string
  agentType?: AgentType
  timestamp: number
  dagExecutionId?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface FileItem {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileItem[]
  size?: number
  modifiedAt?: number
}

export interface AppSettings {
  workDir: string
  llmConfigs: LLMConfig[]
  defaultLLMConfigId: string
  maxRetries: number
  theme: 'dark' | 'light'
  language: string
  skillsPath: string[]
}

export type AgentType = 'orchestrator' | 'retriever' | 'summarizer' | 'generator' | 'verifier'

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'

export const AGENT_LABELS: Record<AgentType, string> = {
  orchestrator: '编排者',
  retriever: '检索者',
  summarizer: '归纳者',
  generator: '生成者',
  verifier: '校验者',
}

export const AGENT_COLORS: Record<AgentType, string> = {
  orchestrator: '#3b82f6',
  retriever: '#10b981',
  summarizer: '#f59e0b',
  generator: '#8b5cf6',
  verifier: '#ef4444',
}
