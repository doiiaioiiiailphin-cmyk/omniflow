import Anthropic from '@anthropic-ai/sdk'
import { LLMConfig } from '../../types'

export async function chatWithAnthropic(config: LLMConfig, systemPrompt: string, userMessage: string): Promise<string> {
  const client = new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || 'https://api.anthropic.com',
  })

  const response = await client.messages.create({
    model: config.model,
    max_tokens: config.maxTokens ?? 4096,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage },
    ],
    temperature: config.temperature ?? 0.7,
  })

  const block = response.content[0]
  if (block && block.type === 'text') {
    return block.text
  }
  return ''
}
