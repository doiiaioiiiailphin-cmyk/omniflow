import { LLMConfig } from '../types'
import { chatWithOpenAI } from './providers/openai'
import { chatWithAnthropic } from './providers/anthropic'
import { chatWithGoogle } from './providers/google'
import { chatWithDeepSeek } from './providers/deepseek'
import { chatWithOllama } from './providers/ollama'

export async function llmChat(config: LLMConfig, systemPrompt: string, userMessage: string): Promise<{ content: string; tokens: number; duration: number }> {
  const startTime = Date.now()
  let content = ''

  switch (config.provider) {
    case 'openai':
    case 'openrouter':
      content = await chatWithOpenAI(config, systemPrompt, userMessage)
      break
    case 'anthropic':
      content = await chatWithAnthropic(config, systemPrompt, userMessage)
      break
    case 'google':
      content = await chatWithGoogle(config, systemPrompt, userMessage)
      break
    case 'deepseek':
      content = await chatWithDeepSeek(config, systemPrompt, userMessage)
      break
    case 'ollama':
      content = await chatWithOllama(config, systemPrompt, userMessage)
      break
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`)
  }

  const duration = Date.now() - startTime
  const estimatedTokens = Math.ceil(content.length / 3)

  return { content, tokens: estimatedTokens, duration }
}
