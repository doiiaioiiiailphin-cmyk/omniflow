import { LLMConfig, AgentResult } from '../types'
import { llmChatWithTools } from '../llm/tool-router'
import { AGENT_TOOLS } from '../llm/tools'
import { skillRegistry } from '../skill/skill-registry'

export async function runGenerator(config: LLMConfig, task: string, context: string, workDir: string, feedback?: string): Promise<AgentResult> {
  const skillPrompt = skillRegistry.getSkillPrompt('generator', task)

  const systemPrompt = `你是内容生成专家。你有以下工具：
- write_file: 将生成的内容写入文件
- read_file: 读取参考文件
- exec_command: 执行命令辅助生成

${skillPrompt}

规则：基于素材生成，保持专业准确，按指令格式输出。如果用户提到具体文件名，将结果写入对应文件。`

  let userMessage = `任务：${task}\n素材：${context}`
  if (feedback) {
    userMessage += `\n上一轮反馈（请据此改进）：\n${feedback}`
  }
  userMessage += '\n请生成内容。如果用户指定了输出文件，请用 write_file 保存。'

  const { content, tokens, duration } = await llmChatWithTools(config, systemPrompt, userMessage, AGENT_TOOLS, workDir)

  return { agentType: 'generator', output: content, tokens, duration }
}
