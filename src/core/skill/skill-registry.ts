import { SkillDef, AgentType } from '../types'
import { loadSkills, matchSkill } from './skill-loader'

class SkillRegistry {
  private skills: SkillDef[] = []
  private skillsPaths: string[] = []

  initialize(paths: string[]): void {
    this.skillsPaths = paths
    this.skills = loadSkills(paths)
  }

  reload(): void {
    this.skills = loadSkills(this.skillsPaths)
  }

  getAll(): SkillDef[] {
    return [...this.skills]
  }

  getByName(name: string): SkillDef | undefined {
    return this.skills.find(s => s.name === name)
  }

  getByAgentType(agentType: AgentType): SkillDef[] {
    return this.skills.filter(s => s.agentType === agentType)
  }

  matchForTask(task: string): SkillDef | null {
    return matchSkill(task, this.skills)
  }

  getSkillPrompt(agentType: AgentType, task: string): string {
    const matched = this.matchForTask(task)
    if (matched && matched.agentType === agentType) {
      return matched.systemPrompt
    }
    const agentSkills = this.getByAgentType(agentType)
    if (agentSkills.length > 0) {
      return agentSkills.map(s => s.systemPrompt).join('\n\n')
    }
    return ''
  }
}

export const skillRegistry = new SkillRegistry()
