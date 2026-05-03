import { LLMConfig, AgentResult } from '../types'
import { llmChatWithTools } from '../llm/tool-router'
import { AGENT_TOOLS } from '../llm/tools'
import { extractJson } from '../utils'

export async function classifyIntent(config: LLMConfig, userMessage: string): Promise<{ intent: 'chat' | 'task'; response?: string }> {
  const systemPrompt = `你是 OmniFlow，一个友好的 AI 助手。判断用户输入类型：
1. chat（闲聊/简单问答）：直接回复
2. task（复杂任务）：需要后台 DAG 执行

JSON 回复：{"intent":"chat 或 task","response":"chat 时的回复内容，task 时为 null"}`

  const { content } = await llmChatWithTools(config, systemPrompt, userMessage, [], '.')
  const result = extractJson<{ intent: string; response: string | null }>(content)
  if (result && result.intent === 'chat' && result.response) {
    return { intent: 'chat', response: result.response }
  }
  if (result && result.intent === 'task') {
    return { intent: 'task' }
  }
  return { intent: 'chat', response: content.trim() }
}

export async function decomposeTask(config: LLMConfig, userTask: string): Promise<AgentResult> {
  const systemPrompt = `你是任务编排引擎。拆解用户任务为 JSON DAG：
{"taskSummary":"描述","subtasks":[{"id":"id","agentType":"retriever|summarizer|generator|verifier","task":"描述","dependencies":[]}]}
retriever=检索, summarizer=归纳, generator=生成, verifier=校验。只输出 JSON。`

  const userMessage = `请拆解：${userTask}`
  const { content, tokens, duration } = await llmChatWithTools(config, systemPrompt, userMessage, [], '.')

  return { agentType: 'orchestrator', output: content, tokens, duration }
}

export async function synthesizeResponse(
  config: LLMConfig,
  userTask: string,
  taskSummary: string,
  agentResults: string
): Promise<string> {
  const systemPrompt = `你是 OmniFlow 助手。后台 Agent 完成了任务，请阅读结果并用自然语气呈现给用户。保持 Markdown 格式，不要输出元信息。`

  const userMessage = `用户任务：${userTask}\n\n任务摘要：${taskSummary}\n\nAgent 结果：\n${agentResults}\n\n请合成最终回复：`
  const { content } = await llmChatWithTools(config, systemPrompt, userMessage, [], '.')
  return content
}
