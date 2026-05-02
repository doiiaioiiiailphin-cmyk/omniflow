import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { executeTask } from '../../src/core/dag/task-runner'
import { skillRegistry } from '../../src/core/skill/skill-registry'
import { printHeader, printDAGProgress, printSummary, startSpinner, stopSpinner } from '../ui/progress'
import type { LLMConfig } from '../../src/core/types'
import { getDefaultConfig } from '../../src/core/llm/model-presets'

interface InteractiveOptions {
  settings: Record<string, unknown>
  workDir: string
  modelOverride: string
  verbose: boolean
}

export async function startInteractive(options: InteractiveOptions): Promise<void> {
  const { settings, workDir, modelOverride } = options
  let verbose = options.verbose
  const llmConfigs = (settings.llmConfigs as Array<Record<string, unknown>>) || []

  const builtinSkillsPath = path.join(__dirname, '..', '..', 'skills')
  skillRegistry.initialize([builtinSkillsPath])

  let config: LLMConfig | null = null
  if (modelOverride) {
    const [provider, model] = modelOverride.split(':')
    const found = llmConfigs.find((c: Record<string, unknown>) => c.provider === provider && c.model === model)
    if (found) {
      config = found as unknown as LLMConfig
    } else {
      config = getDefaultConfig(provider, model)
    }
  } else if (llmConfigs.length > 0) {
    config = llmConfigs[0] as unknown as LLMConfig
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\x1b[36m❯\x1b[0m ',
    terminal: true,
  })

  console.log('')
  console.log('  ╭─────────────────────────────────────────╮')
  console.log('  │          OmniFlow CLI v1.0.0            │')
  console.log('  │    Multi-Agent DAG Workflow Tool        │')
  console.log('  ╰─────────────────────────────────────────╯')
  console.log('')

  if (!config || !config.apiKey) {
    console.log('  ⚠ 未配置模型。请使用 /config 设置 API Key')
    console.log('    示例: /config set openai gpt-4o sk-your-key')
    console.log('')
  } else {
    console.log(`  当前模型: ${config.provider}/${config.model}`)
    console.log('')
  }

  console.log('  输入任务描述开始执行，输入 /help 查看帮助')
  console.log('')

  const commands: Record<string, (args: string[]) => Promise<void>> = {
    help: async () => {
      console.log('')
      console.log('  命令:')
      console.log('    /help              显示帮助')
      console.log('    /model <p:model>   切换模型')
      console.log('    /config set <p> <m> <key>  配置 API Key')
      console.log('    /config list       列出已配置的模型')
      console.log('    /verbose           切换详细日志')
      console.log('    /workdir <path>    设置工作目录')
      console.log('    /save <file>       保存上次输出到文件')
      console.log('    /exit              退出')
      console.log('')
    },
    model: async (args) => {
      const [provider, model] = (args[0] || '').split(':')
      if (!provider || !model) {
        console.log('  用法: /model openai:gpt-4o\n')
        return
      }
      const found = llmConfigs.find(
        (c: Record<string, unknown>) => c.provider === provider && c.model === model
      )
      if (found) {
        config = found as unknown as LLMConfig
        console.log(`  ✓ 已切换模型: ${provider}/${model}\n`)
      } else {
        console.log(`  ✗ 未找到该模型配置，请先 /config set\n`)
      }
    },
    config: async (args) => {
      if (args[0] === 'set' && args.length >= 4) {
        const [provider, model, key] = [args[1], args[2], args[3]]
        const cfg: LLMConfig = getDefaultConfig(provider, model)
        cfg.apiKey = key
        const idx = llmConfigs.findIndex(
          (c: Record<string, unknown>) => c.provider === provider && c.model === model
        )
        if (idx >= 0) llmConfigs[idx] = cfg as unknown as Record<string, unknown>
        else llmConfigs.push(cfg as unknown as Record<string, unknown>)
        config = cfg
        settings.llmConfigs = llmConfigs
        const settingsPath = getSettingsPath()
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
        console.log(`  ✓ 已配置: ${provider}/${model}\n`)
      } else if (args[0] === 'list') {
        if (llmConfigs.length === 0) {
          console.log('  暂无配置\n')
          return
        }
        for (const c of llmConfigs) {
          const cfg = c as Record<string, unknown>
          const active = config?.provider === cfg.provider && config?.model === cfg.model ? ' ●' : '  '
          console.log(`  ${active} ${cfg.provider}/${cfg.model}`)
        }
        console.log('')
      } else {
        console.log('  用法: /config set <provider> <model> <api-key>\n')
      }
    },
    verbose: async () => {
      verbose = !verbose
      console.log(`  ✓ 详细日志: ${verbose ? '开启' : '关闭'}\n`)
    },
    workdir: async (args) => {
      if (args[0]) {
        if (fs.existsSync(args[0])) {
          const wd = args[0]
          console.log(`  ✓ 工作目录: ${wd}\n`)
        } else {
          console.log(`  ✗ 目录不存在: ${args[0]}\n`)
        }
      } else {
        console.log(`  当前工作目录: ${workDir}\n`)
      }
    },
  }

  let lastOutput = ''

  rl.prompt()

  rl.on('line', async (line) => {
    const input = line.trim()

    if (!input) {
      rl.prompt()
      return
    }

    if (input.startsWith('/')) {
      const parts = input.slice(1).split(/\s+/)
      const cmd = parts[0]
      const args = parts.slice(1)

      if (cmd === 'exit' || cmd === 'quit' || cmd === 'q') {
        console.log('\n  Bye!\n')
        rl.close()
        return
      }

      if (cmd === 'save' && args[0]) {
        fs.writeFileSync(args[0], lastOutput, 'utf-8')
        console.log(`  ✓ 输出已保存到: ${args[0]}\n`)
        rl.prompt()
        return
      }

      const handler = commands[cmd]
      if (handler) {
        await handler(args)
      } else {
        console.log(`  未知命令: /${cmd}，输入 /help 查看帮助\n`)
      }
      rl.prompt()
      return
    }

    if (!config || !config.apiKey) {
      console.log('  ✗ 请先配置 API Key: /config set <provider> <model> <key>\n')
      rl.prompt()
      return
    }

    // Execute task
    console.log('')
    startSpinner('编排 DAG...')

    let firstProgress = true
    try {
      const execution = await executeTask(config, line, (dag) => {
        stopSpinner()
        if (firstProgress) {
          console.log(`  DAG 已构建 — ${dag.nodes.length} 个子任务\n`)
          firstProgress = false
        }
        if (verbose || dag.nodes.some(n => n.status === 'completed' || n.status === 'failed')) {
          printDAGProgress(dag, verbose)
        } else {
          startSpinner(`运行中: ${dag.nodes.filter(n => n.status === 'running').map(n => n.task.slice(0, 30)).join(', ')}`)
        }
      })

      stopSpinner()
      if (verbose) printSummary(execution, verbose)

      const finalOutputs = execution.nodes
        .filter(n => n.agentType === 'generator' && n.result)
        .map(n => `## ${n.task}\n\n${n.result!.output}`)
        .join('\n\n')

      lastOutput = finalOutputs || execution.nodes
        .filter(n => n.result)
        .map(n => n.result!.output)
        .join('\n\n')

      console.log('\n' + '═'.repeat(60))
      console.log(lastOutput)
      console.log('═'.repeat(60) + '\n')
    } catch (err) {
      stopSpinner()
      console.log(`\n  ✗ 执行出错: ${err instanceof Error ? err.message : String(err)}\n`)
    }

    rl.prompt()
  })

  rl.on('close', () => {
    process.exit(0)
  })
}

function getSettingsPath(): string {
  const dir = path.join(os.homedir(), '.omniflow')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return path.join(dir, 'settings.json')
}
