import * as fs from 'fs'
import * as path from 'path'
import { SkillDef } from '../types'

export function loadSkills(skillsPaths: string[]): SkillDef[] {
  const skills: SkillDef[] = []

  for (const skillsPath of skillsPaths) {
    if (!fs.existsSync(skillsPath)) continue

    const entries = fs.readdirSync(skillsPath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const skillDir = path.join(skillsPath, entry.name)
      const skillMdPath = path.join(skillDir, 'SKILL.md')
      const metaPath = path.join(skillDir, '_meta.json')

      if (!fs.existsSync(skillMdPath)) continue

      const skillMd = fs.readFileSync(skillMdPath, 'utf-8')
      const meta = fs.existsSync(metaPath)
        ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
        : {}

      const skill = parseSkillDef(entry.name, skillDir, skillMd, meta)
      skills.push(skill)
    }
  }

  return skills
}

function parseSkillDef(name: string, dirPath: string, skillMd: string, meta: Record<string, unknown>): SkillDef {
  const triggers: string[] = []
  let description = ''
  let agentType = 'orchestrator'
  let systemPrompt = ''
  const tools: string[] = []

  const lines = skillMd.split('\n')
  let inPrompt = false
  let inTriggers = false

  for (const line of lines) {
    if (line.startsWith('# ') && description === '') {
      description = line.replace('# ', '').trim()
    }
    if (line.toLowerCase().includes('trigger') || line.toLowerCase().includes('触发')) {
      inTriggers = true
      continue
    }
    if (inTriggers && line.trim().startsWith('-')) {
      triggers.push(line.replace(/^-\s*/, '').trim())
    }
    if (inTriggers && line.trim() === '') {
      inTriggers = false
    }
    if (line.startsWith('## Agent')) {
      const agentMatch = line.match(/retriever|summarizer|generator|verifier|orchestrator/i)
      if (agentMatch) agentType = agentMatch[0].toLowerCase()
    }
    if (line.includes('```system') || line.startsWith('## System Prompt')) {
      inPrompt = true
      continue
    }
    if (inPrompt && line.trim() === '```') {
      inPrompt = false
      continue
    }
    if (inPrompt) {
      systemPrompt += line + '\n'
    }
  }

  return {
    name,
    version: (meta.version as string) || '1.0.0',
    description: description || name,
    triggers: triggers.length > 0 ? triggers : [name],
    agentType: agentType as SkillDef['agentType'],
    systemPrompt: systemPrompt.trim() || skillMd,
    tools,
    scripts: [],
    path: dirPath,
  }
}

export function matchSkill(task: string, skills: SkillDef[]): SkillDef | null {
  const taskLower = task.toLowerCase()
  let bestMatch: SkillDef | null = null
  let bestScore = 0

  for (const skill of skills) {
    let score = 0
    for (const trigger of skill.triggers) {
      if (taskLower.includes(trigger.toLowerCase())) {
        score += trigger.length
      }
    }
    if (taskLower.includes(skill.name.toLowerCase())) {
      score += skill.name.length * 2
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = skill
    }
  }

  return bestMatch
}
