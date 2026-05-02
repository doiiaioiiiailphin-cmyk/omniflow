import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { MODEL_PRESETS, getDefaultConfig } from '../../src/core/llm/model-presets'
import type { LLMConfig } from '../../src/core/types'

interface ConfigOptions {
  action: string
  args: string[]
  settings: Record<string, unknown>
  llmConfigs: Array<Record<string, unknown>>
}

export async function manageConfig(options: ConfigOptions): Promise<void> {
  const { action, args, settings, llmConfigs } = options

  const settingsPath = path.join(os.homedir(), '.omniflow', 'settings.json')

  switch (action) {
    case 'add':
    case 'set': {
      let provider = args[0] || ''
      let model = args[1] || ''
      let apiKey = args[2] || ''

      if (!provider || !model) {
        console.log('\n  可用的模型预设:\n')
        for (const p of MODEL_PRESETS) {
          console.log(`  ${p.provider.toUpperCase()}`)
          for (const m of p.models) {
            console.log(`    ${p.provider}:${m.id}`)
          }
        }
        console.log('')
        console.log('  用法: omniflow config add <provider> <model> <api-key>')
        console.log('  示例: omniflow config add openai gpt-4o sk-xxx\n')
        return
      }

      if (!apiKey) {
        process.stdout.write('  API Key: ')
        const buf = Buffer.alloc(1024)
        const len = fs.readSync(0, buf, 0, 1024, 0)
        apiKey = buf.toString('utf-8', 0, len).trim()
      }

      const cfg: LLMConfig = getDefaultConfig(provider, model)
      cfg.apiKey = apiKey

      const idx = llmConfigs.findIndex(
        (c: Record<string, unknown>) => c.provider === provider && c.model === model
      )
      if (idx >= 0) {
        llmConfigs[idx] = cfg as unknown as Record<string, unknown>
        console.log(`\n  ✓ 已更新: ${provider}/${model}\n`)
      } else {
        llmConfigs.push(cfg as unknown as Record<string, unknown>)
        console.log(`\n  ✓ 已添加: ${provider}/${model}\n`)
      }

      settings.llmConfigs = llmConfigs
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
      break
    }

    case 'remove':
    case 'rm': {
      const [provider, model] = [args[0] || '', args[1] || '']
      if (!provider || !model) {
        console.log('  用法: omniflow config remove <provider> <model>\n')
        return
      }
      const idx = llmConfigs.findIndex(
        (c: Record<string, unknown>) => c.provider === provider && c.model === model
      )
      if (idx >= 0) {
        llmConfigs.splice(idx, 1)
        settings.llmConfigs = llmConfigs
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
        console.log(`\n  ✓ 已移除: ${provider}/${model}\n`)
      } else {
        console.log(`\n  ✗ 未找到: ${provider}/${model}\n`)
      }
      break
    }

    case 'list':
    default: {
      if (llmConfigs.length === 0) {
        console.log('\n  暂无已配置的模型。使用 `omniflow config add` 添加\n')
        return
      }
      console.log('\n  已配置的模型:\n')
      for (const c of llmConfigs) {
        const cfg = c as Record<string, unknown>
        const key = (cfg.apiKey as string) || ''
        const masked = key.slice(0, 4) + '****' + key.slice(-4)
        console.log(`  ● ${cfg.provider}/${cfg.model}`)
        console.log(`    Key: ${masked}`)
      }
      console.log('')
      break
    }
  }
}
