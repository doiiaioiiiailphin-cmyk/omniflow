#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { runTask } from './commands/run'
import { startInteractive } from './commands/interactive'
import { manageConfig } from './commands/config'
import { manageSkill } from './commands/skill'

const USAGE = `
OmniFlow CLI - Multi-Agent DAG Workflow Tool

Usage:
  omniflow [command] [options]

Commands:
  run <task>        Execute a task (one-shot)
  repl              Start interactive REPL mode (default)
  config <action>   Manage LLM configuration
  skill <action>    Manage skills
  help              Show this help

Options:
  --model, -m       Override model (provider:model)
  --work-dir, -w    Set working directory
  --output, -o      Save output to file
  --verbose, -v     Show detailed agent logs
  --version         Show version

Examples:
  omniflow run "整理项目进度报告"
  omniflow -m openai:gpt-4o run "分析合同风险"
  echo "总结这篇文章" | omniflow run
  omniflow repl
  omniflow config add
`

function getSettingsPath(): string {
  const dir = path.join(os.homedir(), '.omniflow')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return path.join(dir, 'settings.json')
}

function loadSettings(): Record<string, unknown> {
  const p = getSettingsPath()
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch { /* ignore */ }
  return { llmConfigs: [], workDir: process.cwd() }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const settings = loadSettings()
  const llmConfigs = (settings.llmConfigs as Array<Record<string, unknown>>) || []
  const workDir = (settings.workDir as string) || process.cwd()

  // Parse options
  let modelOverride = ''
  let workDirOverride = ''
  let outputFile = ''
  let verbose = false
  let command = ''
  let commandArgs: string[] = []

  let i = 0
  while (i < args.length) {
    const arg = args[i]
    if (arg === '--model' || arg === '-m') {
      modelOverride = args[++i] || ''
    } else if (arg === '--work-dir' || arg === '-w') {
      workDirOverride = args[++i] || ''
    } else if (arg === '--output' || arg === '-o') {
      outputFile = args[++i] || ''
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true
    } else if (arg === '--version') {
      console.log('OmniFlow CLI v1.0.0')
      return
    } else if (arg === '--help' || arg === '-h') {
      console.log(USAGE)
      return
    } else if (!command && ['run', 'repl', 'config', 'skill', 'help'].includes(arg)) {
      command = arg
    } else {
      commandArgs.push(arg)
    }
    i++
  }

  const effectiveWorkDir = workDirOverride || workDir

  // Handle pipe/stdin
  let pipedInput = ''
  if (!process.stdin.isTTY) {
    pipedInput = fs.readFileSync(0, 'utf-8').trim()
  }

  switch (command) {
    case 'run': {
      const task = commandArgs.join(' ') || pipedInput
      if (!task) {
        console.error('Error: No task provided. Use: omniflow run <task>')
        process.exit(1)
      }
      await runTask({
        task,
        llmConfigs,
        workDir: effectiveWorkDir,
        modelOverride,
        outputFile,
        verbose,
      })
      break
    }
    case 'config':
      await manageConfig({ action: commandArgs[0] || 'list', args: commandArgs.slice(1), settings, llmConfigs })
      break
    case 'skill':
      await manageSkill({ action: commandArgs[0] || 'list', args: commandArgs.slice(1), settings })
      break
    case 'repl':
    default:
      await startInteractive({ settings, workDir: effectiveWorkDir, modelOverride, verbose })
      break
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
