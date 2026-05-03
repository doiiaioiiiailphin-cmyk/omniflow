import { LLMConfig, AgentResult } from '../types'
import { llmChatWithTools } from '../llm/tool-router'
import { AGENT_TOOLS } from '../llm/tools'
import { skillRegistry } from '../skill/skill-registry'

export async function runVerifier(config: LLMConfig, task: string, content: string, originalTask: string, workDir: string): Promise<AgentResult> {
  const skillPrompt = skillRegistry.getSkillPrompt('verifier', task)

  const systemPrompt = `你是内容校验专家。${skillPrompt}

JSON 输出：{"passed":true|false,"score":1-10,"issues":[{"severity":"critical|major|minor","description":"描述","suggestion":"建议"}],"summary":"总结"}
规则：检查覆盖度、准确性、一致性、格式。评分低于6分触发重新生成。`

  const userMessage = `原始任务：${originalTask}\n待校验内容：\n${content}\n请校验。`
  const { content: result, tokens, duration } = await llmChatWithTools(config, systemPrompt, userMessage, AGENT_TOOLS, workDir)

  return { agentType: 'verifier', output: result, tokens, duration }
}
