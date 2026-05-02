import { LLMConfig, AgentResult } from '../types'
import { llmChat } from '../llm/llm-router'
import { skillRegistry } from '../skill/skill-registry'

export async function runGenerator(config: LLMConfig, task: string, context: string, feedback?: string): Promise<AgentResult> {
  const skillPrompt = skillRegistry.getSkillPrompt('generator', task)

  const systemPrompt = `你是一个内容生成专家。你的任务是根据提供的素材和指令，生成高质量的内容。

${skillPrompt}

规则：
1. 严格基于提供的素材生成内容，不要凭空编造
2. 保持专业、准确、流畅的写作风格
3. 根据指令要求的格式输出（报告、邮件、方案、代码等）
4. 如果可能，提供多个选项供用户选择
5. 标注生成过程中使用的外部引用`

  let userMessage = `任务：${task}\n\n素材：\n${context}`
  if (feedback) {
    userMessage += `\n\n上一轮反馈（请据此改进）：\n${feedback}`
  }
  userMessage += '\n\n请生成内容。'

  const { content, tokens, duration } = await llmChat(config, systemPrompt, userMessage)

  return {
    agentType: 'generator',
    output: content,
    tokens,
    duration,
  }
}
