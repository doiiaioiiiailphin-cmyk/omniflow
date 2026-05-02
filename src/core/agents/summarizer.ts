import { LLMConfig, AgentResult } from '../types'
import { llmChat } from '../llm/llm-router'
import { skillRegistry } from '../skill/skill-registry'

export async function runSummarizer(config: LLMConfig, task: string, context: string): Promise<AgentResult> {
  const skillPrompt = skillRegistry.getSkillPrompt('summarizer', task)

  const systemPrompt = `你是一个信息归纳专家。你的任务是将多种来源的信息进行归纳、提炼和整合。

${skillPrompt}

规则：
1. 提取核心要点，去除冗余信息
2. 保持逻辑结构清晰，用层次化的方式组织
3. 标注冲突或矛盾的信息点
4. 保留关键数据和引用
5. 输出应当是精炼但完整的`

  const userMessage = `任务：${task}\n\n待归纳内容：\n${context}\n\n请归纳整理。`

  const { content, tokens, duration } = await llmChat(config, systemPrompt, userMessage)

  return {
    agentType: 'summarizer',
    output: content,
    tokens,
    duration,
  }
}
