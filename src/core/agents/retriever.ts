import { LLMConfig, AgentResult } from '../types'
import { llmChatWithTools } from '../llm/tool-router'
import { AGENT_TOOLS } from '../llm/tools'
import { skillRegistry } from '../skill/skill-registry'

export async function runRetriever(config: LLMConfig, task: string, context: string, workDir: string): Promise<AgentResult> {
  const skillPrompt = skillRegistry.getSkillPrompt('retriever', task)

  const systemPrompt = `你是信息检索专家。你有以下工具可用：
- read_file: 读取本地文件
- list_directory: 列出目录内容
- exec_command: 执行命令获取信息

${skillPrompt}

规则：优先从上下文和文件中提取信息，结构化管理结果，标注来源。`

  const userMessage = `任务：${task}\n上下文：${context || '无'}\n请检索相关信息，必要时使用工具读取文件。`
  const { content, tokens, duration } = await llmChatWithTools(config, systemPrompt, userMessage, AGENT_TOOLS, workDir)

  return { agentType: 'retriever', output: content, tokens, duration }
}
