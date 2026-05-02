import { DAGExecution, DAGNode, AgentType } from '../../src/core/types'
import { AGENT_LABELS, AGENT_COLORS } from '../../src/core/types'
import { formatDuration } from '../../src/core/utils'

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const colors: Record<string, string> = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
}

const agentColorNames: Record<AgentType, string> = {
  orchestrator: 'blue',
  retriever: 'green',
  summarizer: 'yellow',
  generator: 'magenta',
  verifier: 'red',
}

function c(color: string, text: string): string {
  return `${colors[color] || ''}${text}${RESET}`
}

let spinnerFrame = 0
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
let spinnerTimer: ReturnType<typeof setInterval> | null = null

export function startSpinner(text: string): void {
  stopSpinner()
  spinnerFrame = 0
  spinnerTimer = setInterval(() => {
    process.stdout.write(`\r${c('cyan', spinnerFrames[spinnerFrame])} ${text}`)
    spinnerFrame = (spinnerFrame + 1) % spinnerFrames.length
  }, 80)
}

export function stopSpinner(): void {
  if (spinnerTimer) {
    clearInterval(spinnerTimer)
    spinnerTimer = null
    process.stdout.write('\r' + ' '.repeat(80) + '\r')
  }
}

export function printStep(agentType: AgentType, status: string, detail?: string): void {
  const icon = status === 'running' ? '→' : status === 'completed' ? '✓' : status === 'failed' ? '✗' : '○'
  const color = agentColorNames[agentType]
  const label = AGENT_LABELS[agentType]
  const statusColor = status === 'completed' ? 'green' : status === 'running' ? 'cyan' : status === 'failed' ? 'red' : 'gray'

  process.stdout.write(
    `  ${c(statusColor, icon)} ${c(color, label.padEnd(8))} ${c('gray', detail || status)}\n`
  )
}

export function printHeader(text: string): void {
  console.log(`\n${c('cyan', BOLD + '◆')} ${c('white', BOLD + text)}${RESET}\n`)
}

export function printDAGProgress(execution: DAGExecution, verbose: boolean): void {
  console.log(c('gray', '\n' + '─'.repeat(50)))
  
  for (const node of execution.nodes) {
    const color = agentColorNames[node.agentType]
    const label = AGENT_LABELS[node.agentType]
    const statusIcon = node.status === 'completed' ? '✓' : node.status === 'running' ? '→' : node.status === 'failed' ? '✗' : '○'
    const statusColor = node.status === 'completed' ? 'green' : node.status === 'running' ? 'cyan' : node.status === 'failed' ? 'red' : 'gray'

    const deps = node.dependencies.length > 0
      ? c('gray', ` (依赖: ${node.dependencies.join(', ')})`)
      : ''

    console.log(
      `  ${c(statusColor, statusIcon)} ${c(color, `[${label}]`)} ${c('white', node.task.slice(0, 60))}${deps}`
    )

    if (verbose && node.result) {
      const preview = node.result.output.slice(0, 200).replace(/\n/g, ' ')
      console.log(c('gray', `    └ ${preview}${node.result.output.length > 200 ? '...' : ''}`))
      console.log(c('gray', `    └ ${formatDuration(node.result.duration)} | ~${node.result.tokens} tokens`))
    }
  }
  
  if (execution.status === 'completed') {
    const totalDuration = (execution.completedAt || Date.now()) - execution.startedAt
    console.log(c('gray', '─'.repeat(50)))
    console.log(c('green', `\n  ✓ 任务完成 — 总耗时: ${formatDuration(totalDuration)}\n`))
  }
}

export function printSummary(execution: DAGExecution, verbose: boolean): void {
  console.log(c('gray', '─'.repeat(50)))
  
  const rows: string[][] = [['Agent', 'Task', 'Duration', 'Tokens']]
  let totalTokens = 0
  let totalDuration = 0

  for (const node of execution.nodes) {
    if (node.result) {
      rows.push([
        AGENT_LABELS[node.agentType],
        node.task.slice(0, 40),
        formatDuration(node.result.duration),
        `~${node.result.tokens}`,
      ])
      totalTokens += node.result.tokens
      totalDuration += node.result.duration
    }
  }

  // Simple aligned table
  const colWidths = [12, 42, 12, 10]
  for (const row of rows) {
    const line = row
      .map((cell, i) => cell.padEnd(colWidths[i]).slice(0, colWidths[i]))
      .join(' ')
    if (row === rows[0]) {
      console.log(c('white', BOLD + line))
      console.log(c('gray', '─'.repeat(50)))
    } else {
      console.log(c('gray', line))
    }
  }
  
  console.log(c('gray', '─'.repeat(50)))
  console.log(c('white', `Total`.padEnd(12) + `${formatDuration(totalDuration)}`.padEnd(42) + `~${totalTokens}`.padEnd(12)))
  console.log()
}

export function clearLine(): void {
  process.stdout.write('\r' + ' '.repeat(80) + '\r')
}
