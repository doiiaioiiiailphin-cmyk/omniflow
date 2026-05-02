import { GoogleGenerativeAI } from '@google/generative-ai'
import { LLMConfig } from '../../types'

export async function chatWithGoogle(config: LLMConfig, systemPrompt: string, userMessage: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(config.apiKey)
  const model = genAI.getGenerativeModel({ model: config.model })

  const prompt = `${systemPrompt}\n\n${userMessage}`

  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text()
}
