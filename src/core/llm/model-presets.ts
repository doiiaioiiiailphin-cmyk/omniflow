import { LLMConfig } from '../types'

export const MODEL_PRESETS: { provider: string; models: { id: string; name: string; maxTokens: number; contextWindow: number }[] }[] = [
  {
    provider: 'openai',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 16384, contextWindow: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 16384, contextWindow: 128000 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 4096, contextWindow: 128000 },
      { id: 'gpt-4', name: 'GPT-4', maxTokens: 4096, contextWindow: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096, contextWindow: 16385 },
      { id: 'o1-preview', name: 'o1 Preview', maxTokens: 32768, contextWindow: 128000 },
      { id: 'o1-mini', name: 'o1 Mini', maxTokens: 65536, contextWindow: 128000 },
    ],
  },
  {
    provider: 'anthropic',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', maxTokens: 8192, contextWindow: 200000 },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', maxTokens: 8192, contextWindow: 200000 },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', maxTokens: 8192, contextWindow: 200000 },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', maxTokens: 4096, contextWindow: 200000 },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', maxTokens: 4096, contextWindow: 200000 },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', maxTokens: 4096, contextWindow: 200000 },
    ],
  },
  {
    provider: 'google',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', maxTokens: 8192, contextWindow: 1048576 },
      { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro Exp', maxTokens: 8192, contextWindow: 1048576 },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', maxTokens: 8192, contextWindow: 1048576 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', maxTokens: 8192, contextWindow: 1048576 },
    ],
  },
  {
    provider: 'deepseek',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3', maxTokens: 8192, contextWindow: 65536 },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1', maxTokens: 8192, contextWindow: 65536 },
    ],
  },
  {
    provider: 'ollama',
    models: [
      { id: 'llama3.2', name: 'Llama 3.2', maxTokens: 4096, contextWindow: 131072 },
      { id: 'llama3.1:70b', name: 'Llama 3.1 70B', maxTokens: 4096, contextWindow: 131072 },
      { id: 'qwen2.5:14b', name: 'Qwen 2.5 14B', maxTokens: 4096, contextWindow: 32768 },
      { id: 'qwen2.5:32b', name: 'Qwen 2.5 32B', maxTokens: 4096, contextWindow: 32768 },
      { id: 'qwen2.5:72b', name: 'Qwen 2.5 72B', maxTokens: 4096, contextWindow: 32768 },
      { id: 'mistral-nemo', name: 'Mistral Nemo', maxTokens: 4096, contextWindow: 131072 },
      { id: 'codestral', name: 'Codestral', maxTokens: 4096, contextWindow: 32768 },
      { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', maxTokens: 4096, contextWindow: 65536 },
      { id: 'gemma2:27b', name: 'Gemma 2 27B', maxTokens: 4096, contextWindow: 8192 },
      { id: 'phi3:medium', name: 'Phi-3 Medium', maxTokens: 4096, contextWindow: 131072 },
    ],
  },
  {
    provider: 'openrouter',
    models: [
      { id: 'openai/gpt-4o', name: 'GPT-4o (OpenRouter)', maxTokens: 16384, contextWindow: 128000 },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OpenRouter)', maxTokens: 8192, contextWindow: 200000 },
      { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash (OpenRouter)', maxTokens: 8192, contextWindow: 1048576 },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', maxTokens: 4096, contextWindow: 131072 },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (OpenRouter)', maxTokens: 8192, contextWindow: 65536 },
    ],
  },
]

export function getDefaultConfig(provider: string, modelId: string): LLMConfig {
  const baseUrls: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com',
    deepseek: 'https://api.deepseek.com',
    openrouter: 'https://openrouter.ai/api/v1',
    ollama: 'http://localhost:11434',
  }
  return {
    provider,
    model: modelId,
    apiKey: '',
    baseUrl: baseUrls[provider] || '',
    temperature: 0.7,
    maxTokens: 4096,
  }
}

export function getModelMaxTokens(provider: string, modelId: string): number {
  const preset = MODEL_PRESETS.find(p => p.provider === provider)
  if (!preset) return 4096
  const model = preset.models.find(m => m.id === modelId)
  return model?.maxTokens || 4096
}
