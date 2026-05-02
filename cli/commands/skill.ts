import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { loadSkills } from '../../src/core/skill/skill-loader'

interface SkillOptions {
  action: string
  args: string[]
  settings: Record<string, unknown>
}

export async function manageSkill(options: SkillOptions): Promise<void> {
  const { action, args, settings } = options
  const skillsPaths = (settings.skillsPath as string[]) || []
  
  // Add builtin skills path
  const builtinPath = path.join(__dirname, '..', '..', 'skills')
  const allPaths = [...new Set([builtinPath, ...skillsPaths].filter(p => fs.existsSync(p)))]

  switch (action) {
    case 'add': {
      const dir = args[0] || process.cwd()
      if (!fs.existsSync(dir)) {
        console.log(`\n  ✗ 目录不存在: ${dir}\n`)
        return
      }
      if (!skillsPaths.includes(dir)) {
        skillsPaths.push(dir)
        settings.skillsPath = skillsPaths
        const settingsPath = path.join(os.homedir(), '.omniflow', 'settings.json')
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
        console.log(`\n  ✓ 已添加 Skill 目录: ${dir}\n`)
      } else {
        console.log(`\n  Skill 目录已存在\n`)
      }
      break
    }

    case 'remove':
    case 'rm': {
      const dir = args[0] || ''
      const idx = skillsPaths.indexOf(dir)
      if (idx >= 0) {
        skillsPaths.splice(idx, 1)
        settings.skillsPath = skillsPaths
        const settingsPath = path.join(os.homedir(), '.omniflow', 'settings.json')
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
        console.log(`\n  ✓ 已移除\n`)
      } else {
        console.log(`\n  ✗ 未找到该 Skill 目录\n`)
      }
      break
    }

    case 'list':
    default: {
      const skills = loadSkills(allPaths)
      if (skills.length === 0) {
        console.log('\n  暂无安装的 Skill\n')
        return
      }
      console.log('\n  已安装的 Skills:\n')
      for (const s of skills) {
        console.log(`  ● ${s.name} v${s.version}`)
        console.log(`    ${s.description}`)
        console.log(`    Agent: ${s.agentType} | 触发词: ${s.triggers.join(', ')}`)
        console.log('')
      }
      console.log('\n  添加 Skill: omniflow skill add <目录路径>\n')
      break
    }
  }
}
