import { v4 as uuidv4 } from 'uuid'

export function generateId(): string {
  return uuidv4()
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').trim()
}

export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}

export function extractJson<T>(text: string): T | null {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) {
    try { return JSON.parse(match[1]) } catch { /* fall through */ }
  }
  try { return JSON.parse(text) } catch { return null }
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as unknown as T
}
