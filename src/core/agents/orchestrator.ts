import { LLMConfig, AgentResult } from '../types'
import { llmChat } from '../llm/llm-router'

export async function runOrchestrator(config: LLMConfig, userTask: string): Promise<AgentResult> {
  const systemPrompt = `你是一个任务编排专家。你的工作是分析用户的请求，将其拆解为多个子任务，并确定子任务之间的依赖关系。

请以 JSON 格式输出任务拆解结果。格式如下：
\`\`\`json
{
  "taskSummary": "任务一句话描述",
  "subtasks": [
    {
      "id": "唯一标识",
      "agentType": "retriever|summarizer|generator|verifier",
      "task": "该子任务的具体描述",
      "dependencies": ["依赖的其他子任务id列表"]
    }
  ]
}
\`\`\`

规则：
1. 简单任务拆成1-3个子任务，复杂任务拆成3-6个
2. retriever 用于搜索、读取、查找信息
3. summarizer 用于归纳、提炼、总结
4. generator 用于生成、创作、撰写
5. verifier 用于校验、检查、审查（放在generator之后）
6. 依赖关系要合理，确保执行顺序正确
7. 只在必要时使用 verifier

只输出JSON，不要其他内容。`

  const userMessage = `请拆解以下任务：\n\n${userTask}`

  const { content, tokens, duration } = await llmChat(config, systemPrompt, userMessage)

  return {
    agentType: 'orchestrator',
    output: content,
    tokens,
    duration,
  }
}
