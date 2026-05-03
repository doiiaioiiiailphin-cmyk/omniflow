import { LLMConfig } from '../types'
import { AGENT_TOOLS, ToolDef, executeToolCall, toolsToOpenAIFormat } from './tools'
import OpenAI from 'openai'

interface ToolCallMessage {
  role: 'assistant'
  content: string | null
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }>
}

interface ToolResultMessage {
  role: 'tool'
  tool_call_id: string
  content: string
}

type ChatMessage = 
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | ToolCallMessage
  | ToolResultMessage

export async function llmChatWithTools(
  config: LLMConfig,
  systemPrompt: string,
  userMessage: string,
  tools: ToolDef[],
  workDir: string
): Promise<{ content: string; tokens: number; duration: number }> {
  const startTime = Date.now()
  let totalTokens = 0

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || 'https://api.openai.com/v1',
  })

  const MAX_TOOL_ROUNDS = 5
  let finalContent = ''

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await client.chat.completions.create({
      model: config.model,
      messages: messages as any,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 4096,
      tools: tools.length > 0 ? toolsToOpenAIFormat(tools) as any : undefined,
      tool_choice: tools.length > 0 ? 'auto' as const : undefined,
    })

    const choice = response.choices[0]
    if (!choice) break

    totalTokens += response.usage?.total_tokens || 0

    const msg = choice.message

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      const assistantMsg: ToolCallMessage = {
        role: 'assistant',
        content: msg.content,
        tool_calls: msg.tool_calls.map(tc => ({
          id: tc.id,
          type: 'function' as const,
          function: { name: tc.function.name, arguments: tc.function.arguments },
        })),
      }
      messages.push(assistantMsg)

      for (const tc of msg.tool_calls) {
        let args: Record<string, unknown> = {}
        try { args = JSON.parse(tc.function.arguments) } catch { /* ignore parse errors */ }
        
        const result = executeToolCall(tc.function.name, args, workDir)
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: result,
        })
      }
      continue
    }

    finalContent = msg.content || ''
    break
  }

  if (!finalContent) {
    finalContent = 'Task processed successfully.'
  }

  const duration = Date.now() - startTime
  return { content: finalContent, tokens: totalTokens, duration }
}
