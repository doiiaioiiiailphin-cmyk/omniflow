import { LLMConfig, AgentResult } from '../types'
import { llmChat } from '../llm/llm-router'
import { skillRegistry } from '../skill/skill-registry'

export async function runRetriever(config: LLMConfig, task: string, context: string): Promise<AgentResult> {
  const skillPrompt = skillRegistry.getSkillPrompt('retriever', task)

  const systemPrompt = `你是一个信息检索专家。你的任务是根据用户的需求检索和提取相关信息。

${skillPrompt}

规则：
1. 尽可能全面地收集与任务相关的信息
2. 如果提供了上下文，优先从上下文中提取信息
3. 输出结构化的检索结果，按主题分类
4. 标注信息的来源和可信度
5. 如果信息不足，明确指出缺失的部分`

  const userMessage = `任务：${task}\n\n上下文：${context || '无'}\n\n请检索并整理相关信息。`

  const { content, tokens, duration } = await llmChat(config, systemPrompt, userMessage)

  return {
    agentType: 'retriever',
    output: content,
    tokens,
    duration,
  }
}
