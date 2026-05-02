import OpenAI from 'openai'
import { LLMConfig } from '../../types'

export async function chatWithOpenAI(config: LLMConfig, systemPrompt: string, userMessage: string): Promise<string> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || 'https://api.openai.com/v1',
  })

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: config.temperature ?? 0.7,
    max_tokens: config.maxTokens ?? 4096,
  })

  return response.choices[0]?.message?.content || ''
}
