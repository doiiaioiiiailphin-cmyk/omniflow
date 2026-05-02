import { LLMConfig } from '../types'

export const MODEL_PRESETS: { provider: string; models: { id: string; name: string; maxTokens: number; contextWindow: number }[] }[] = [
  {
    provider: 'openai',
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1', maxTokens: 32768, contextWindow: 1048576 },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', maxTokens: 32768, contextWindow: 1048576 },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', maxTokens: 16384, contextWindow: 1048576 },
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 16384, contextWindow: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 16384, contextWindow: 128000 },
      { id: 'o4-mini', name: 'o4-mini', maxTokens: 100000, contextWindow: 200000 },
      { id: 'o3', name: 'o3', maxTokens: 100000, contextWindow: 200000 },
      { id: 'o3-mini', name: 'o3-mini', maxTokens: 100000, contextWindow: 200000 },
      { id: 'o1', name: 'o1', maxTokens: 100000, contextWindow: 200000 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 4096, contextWindow: 128000 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096, contextWindow: 16385 },
    ],
  },
  {
    provider: 'anthropic',
    models: [
      { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', maxTokens: 128000, contextWindow: 1000000 },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', maxTokens: 64000, contextWindow: 1000000 },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', maxTokens: 64000, contextWindow: 200000 },
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', maxTokens: 128000, contextWindow: 1000000 },
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', maxTokens: 64000, contextWindow: 200000 },
      { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', maxTokens: 64000, contextWindow: 200000 },
      { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', maxTokens: 32000, contextWindow: 200000 },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (deprecated)', maxTokens: 64000, contextWindow: 200000 },
    ],
  },
  {
    provider: 'google',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', maxTokens: 65536, contextWindow: 2097152 },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', maxTokens: 32768, contextWindow: 1048576 },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', maxTokens: 8192, contextWindow: 1048576 },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', maxTokens: 8192, contextWindow: 1048576 },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', maxTokens: 8192, contextWindow: 2097152 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', maxTokens: 8192, contextWindow: 1048576 },
    ],
  },
  {
    provider: 'deepseek',
    models: [
      { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', maxTokens: 384000, contextWindow: 1048576 },
      { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', maxTokens: 384000, contextWindow: 1048576 },
      { id: 'deepseek-chat', name: 'DeepSeek V3 (deprecated)', maxTokens: 8192, contextWindow: 131072 },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1 (deprecated)', maxTokens: 8192, contextWindow: 131072 },
    ],
  },
  {
    provider: 'ollama',
    models: [
      { id: 'llama3.3:70b', name: 'Llama 3.3 70B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'llama3.2', name: 'Llama 3.2', maxTokens: 4096, contextWindow: 131072 },
      { id: 'qwen3:30b', name: 'Qwen 3 30B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'qwen3:14b', name: 'Qwen 3 14B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'qwen3:8b', name: 'Qwen 3 8B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'qwen2.5:72b', name: 'Qwen 2.5 72B', maxTokens: 4096, contextWindow: 32768 },
      { id: 'qwen2.5:32b', name: 'Qwen 2.5 32B', maxTokens: 4096, contextWindow: 32768 },
      { id: 'qwen2.5:14b', name: 'Qwen 2.5 14B', maxTokens: 4096, contextWindow: 32768 },
      { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', maxTokens: 4096, contextWindow: 32768 },
      { id: 'qwen2.5-coder:32b', name: 'Qwen 2.5 Coder 32B', maxTokens: 4096, contextWindow: 32768 },
      { id: 'deepseek-r1:70b', name: 'DeepSeek R1 70B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'deepseek-r1:32b', name: 'DeepSeek R1 32B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'deepseek-r1:14b', name: 'DeepSeek R1 14B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'mistral-large:latest', name: 'Mistral Large', maxTokens: 8192, contextWindow: 131072 },
      { id: 'mistral-small:latest', name: 'Mistral Small', maxTokens: 4096, contextWindow: 32768 },
      { id: 'mistral-nemo:latest', name: 'Mistral Nemo', maxTokens: 4096, contextWindow: 131072 },
      { id: 'codestral:latest', name: 'Codestral', maxTokens: 4096, contextWindow: 32768 },
      { id: 'phi4:latest', name: 'Phi-4 14B', maxTokens: 4096, contextWindow: 16384 },
      { id: 'phi4-mini:latest', name: 'Phi-4 Mini 3.8B', maxTokens: 2048, contextWindow: 131072 },
      { id: 'gemma3:27b', name: 'Gemma 3 27B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'gemma3:12b', name: 'Gemma 3 12B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'gemma3:4b', name: 'Gemma 3 4B', maxTokens: 4096, contextWindow: 131072 },
      { id: 'command-r-plus:latest', name: 'Command R+ 104B', maxTokens: 4096, contextWindow: 131072 },
      { id: 'command-r:latest', name: 'Command R 35B', maxTokens: 4096, contextWindow: 131072 },
    ],
  },
  {
    provider: 'openrouter',
    models: [
      { id: 'openai/gpt-4.1', name: 'GPT-4.1', maxTokens: 32768, contextWindow: 1048576 },
      { id: 'openai/o4-mini', name: 'o4-mini', maxTokens: 100000, contextWindow: 200000 },
      { id: 'openai/o3', name: 'o3', maxTokens: 100000, contextWindow: 200000 },
      { id: 'openai/gpt-4o', name: 'GPT-4o', maxTokens: 16384, contextWindow: 128000 },
      { id: 'anthropic/claude-opus-4-7', name: 'Claude Opus 4.7', maxTokens: 128000, contextWindow: 1000000 },
      { id: 'anthropic/claude-sonnet-4-6', name: 'Claude Sonnet 4.6', maxTokens: 64000, contextWindow: 1000000 },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', maxTokens: 65536, contextWindow: 2097152 },
      { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', maxTokens: 32768, contextWindow: 1048576 },
      { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro', maxTokens: 384000, contextWindow: 1048576 },
      { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash', maxTokens: 384000, contextWindow: 1048576 },
      { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', maxTokens: 4096, contextWindow: 131072 },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', maxTokens: 8192, contextWindow: 131072 },
      { id: 'qwen/qwen3-30b', name: 'Qwen 3 30B', maxTokens: 8192, contextWindow: 131072 },
    ],
  },
]

export function getDefaultConfig(provider: string, modelId: string): LLMConfig {
  const baseUrls: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com',
    google: 'https://generativelanguage.googleapis.com/v1beta',
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
