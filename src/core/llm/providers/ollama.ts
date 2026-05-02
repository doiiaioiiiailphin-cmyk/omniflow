import { LLMConfig } from '../../types'

export async function chatWithOllama(config: LLMConfig, systemPrompt: string, userMessage: string): Promise<string> {
  const baseUrl = config.baseUrl || 'http://localhost:11434'

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      options: {
        temperature: config.temperature ?? 0.7,
        num_predict: config.maxTokens ?? 4096,
      },
    }),
  })

  const data = await response.json()
  return data.message?.content || ''
}
