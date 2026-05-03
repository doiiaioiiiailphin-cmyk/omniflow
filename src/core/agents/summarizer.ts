import { LLMConfig, AgentResult } from '../types'
import { llmChatWithTools } from '../llm/tool-router'
import { AGENT_TOOLS } from '../llm/tools'
import { skillRegistry } from '../skill/skill-registry'

export async function runSummarizer(config: LLMConfig, task: string, context: string, workDir: string): Promise<AgentResult> {
  const skillPrompt = skillRegistry.getSkillPrompt('summarizer', task)

  const systemPrompt = `你是信息归纳专家。${skillPrompt}

规则：提取核心要点，去除冗余，层次化组织，保留关键数据，标注冲突点。`

  const userMessage = `任务：${task}\n待归纳内容：\n${context}\n请归纳整理。`
  const { content, tokens, duration } = await llmChatWithTools(config, systemPrompt, userMessage, AGENT_TOOLS, workDir)

  return { agentType: 'summarizer', output: content, tokens, duration }
}
