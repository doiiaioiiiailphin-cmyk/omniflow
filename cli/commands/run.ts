import * as fs from 'fs'
import * as path from 'path'
import { executeTask } from '../../src/core/dag/task-runner'
import { skillRegistry } from '../../src/core/skill/skill-registry'
import { MODEL_PRESETS, getDefaultConfig } from '../../src/core/llm/model-presets'
import { printHeader, printDAGProgress, printSummary, startSpinner, stopSpinner } from '../ui/progress'
import type { LLMConfig } from '../../src/core/types'

interface RunOptions {
  task: string
  llmConfigs: Array<Record<string, unknown>>
  workDir: string
  modelOverride: string
  outputFile: string
  verbose: boolean
}

function resolveConfig(configs: Array<Record<string, unknown>>, override: string): LLMConfig | null {
  if (override) {
    const [provider, model] = override.split(':')
    const config = configs.find(
      (c: Record<string, unknown>) => c.provider === provider && c.model === model
    )
    if (config) return config as unknown as LLMConfig

    const def = getDefaultConfig(provider, model)
    for (const c of configs) {
      if ((c as Record<string, unknown>).provider === provider) {
        def.apiKey = (c as Record<string, unknown>).apiKey as string || ''
        break
      }
    }
    return def
  }

  if (configs.length === 0) return null
  return configs[0] as unknown as LLMConfig
}

export async function runTask(options: RunOptions): Promise<void> {
  const { task, llmConfigs, workDir, modelOverride, outputFile, verbose } = options

  // Initialize skills
  const builtinSkillsPath = path.join(__dirname, '..', '..', 'skills')
  skillRegistry.initialize([builtinSkillsPath])

  // Resolve LLM config
  const config = resolveConfig(llmConfigs, modelOverride)
  if (!config) {
    console.error('\n  ✗ 未配置模型。请先运行: omniflow config add\n')
    process.exit(1)
  }
  if (!config.apiKey) {
    console.error(`\n  ✗ 模型 ${config.provider}/${config.model} 未设置 API Key。\n`)
    console.error(`  请运行: omniflow config add\n`)
    process.exit(1)
  }

  printHeader(`任务执行`)
  console.log(`  模型: ${config.provider}/${config.model}`)
  console.log(`  目录: ${workDir}`)
  console.log(`  任务: ${task}\n`)

  startSpinner('编排任务 DAG...')

  let firstProgress = true
  const execution = await executeTask(config, task, (dag) => {
    stopSpinner()
    if (firstProgress) {
      console.log(`\n  DAG 已构建 — ${dag.nodes.length} 个子任务\n`)
      firstProgress = false
    }
    if (verbose || dag.nodes.some(n => n.status === 'completed' || n.status === 'failed')) {
      printDAGProgress(dag, verbose)
    } else {
      startSpinner(`运行中: ${dag.nodes.filter(n => n.status === 'running').map(n => n.task.slice(0, 30)).join(', ')}`)
    }
  })

  stopSpinner()

  if (verbose) {
    printSummary(execution, verbose)
  }

  // Collect final output
  const finalOutputs = execution.nodes
    .filter(n => n.agentType === 'generator' && n.result)
    .map(n => `## ${n.task}\n\n${n.result!.output}`)
    .join('\n\n')

  const output = finalOutputs || execution.nodes
    .filter(n => n.result)
    .map(n => n.result!.output)
    .join('\n\n')

  if (outputFile) {
    fs.writeFileSync(outputFile, output, 'utf-8')
    console.log(`  ✓ 输出已保存到: ${outputFile}\n`)
  } else {
    console.log('\n' + '═'.repeat(60))
    console.log(output)
    console.log('═'.repeat(60) + '\n')
  }
}
