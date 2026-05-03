import { LLMConfig, AgentResult } from '../types'
import { llmChat } from '../llm/llm-router'
import { extractJson } from '../utils'

export async function classifyIntent(config: LLMConfig, userMessage: string): Promise<{ intent: 'chat' | 'task'; response?: string }> {
  const systemPrompt = `你是 OmniFlow，一个友好的 AI 助手。你首先需要判断用户的输入是什么类型：

1. **chat**（闲聊/简单问答）：用户只是在聊天、问好、问简单问题、或者请求直接回答。这类消息你直接回复即可，不需要调用后台 Agent。
2. **task**（复杂任务）：用户要求执行一个需要多步骤处理的复杂任务，比如生成报告、整理资料、分析文件、内容创作等。这类任务需要拆解成 DAG 子任务来执行。

请用 JSON 回复：
\`\`\`json
{
  "intent": "chat 或 task",
  "response": "如果是 chat，这里是你的直接回复内容（多句话可以）；如果是 task，这里写 null"
}
\`\`\`

规则：
- 遇到"你好""嗨""谢谢"这类，直接 chat 回复
- 遇到"帮我整理""生成""分析""总结"这类需要多步骤的，标记为 task
- chat 回复要友好、自然、简洁`

  const { content } = await llmChat(config, systemPrompt, userMessage)
  const result = extractJson<{ intent: string; response: string | null }>(content)
  if (result && result.intent === 'chat' && result.response) {
    return { intent: 'chat', response: result.response }
  }
  if (result && result.intent === 'task') {
    return { intent: 'task' }
  }
  return { intent: 'chat', response: content.trim() }
}

export async function decomposeTask(config: LLMConfig, userTask: string): Promise<AgentResult> {
  const systemPrompt = `你是 OmniFlow 的任务编排引擎。用户有一个复杂任务，需要你拆解为多个子任务。

请以 JSON 格式输出任务拆解结果：
\`\`\`json
{
  "taskSummary": "任务一句话描述",
  "subtasks": [
    {
      "id": "唯一标识",
      "agentType": "retriever|summarizer|generator|verifier",
      "task": "该子任务的具体描述（给执行 agent 看的）",
      "dependencies": ["依赖的其他子任务id列表"]
    }
  ]
}
\`\`\`

Agent 说明：
- retriever: 搜索、读取、查找信息
- summarizer: 归纳、提炼、总结
- generator: 生成、创作、撰写
- verifier: 校验、检查、审查（放在 generator 之后）

规则：
1. 简单任务 1-2 个子任务，复杂任务 3-5 个
2. 只输出 JSON，不要其他内容
3. 依赖关系要合理，确保执行顺序正确`

  const userMessage = `请拆解以下任务：\n\n${userTask}`

  const { content, tokens, duration } = await llmChat(config, systemPrompt, userMessage)

  return {
    agentType: 'orchestrator',
    output: content,
    tokens,
    duration,
  }
}

export async function synthesizeResponse(
  config: LLMConfig,
  userTask: string,
  taskSummary: string,
  agentResults: string
): Promise<string> {
  const systemPrompt = `你是 OmniFlow，一个友好的 AI 助手。后台 Agent 已经完成了用户的任务，下面是各个 Agent 的执行结果。

你的工作是：
1. 阅读所有 Agent 的执行结果
2. 以自然、友好的语气将最终结果呈现给用户
3. 不要重复"后台 agent 已完成"这类元信息
4. 直接给出用户真正想要的答案或内容
5. 可以适当总结、调整格式，让回复更易读

规则：
- 如果是报告类内容，保持 Markdown 格式
- 如果是简单问答，简洁扼要
- 用用户的原始语言回复`

  const userMessage = `用户任务：${userTask}

任务摘要：${taskSummary}

各 Agent 执行结果：
${agentResults}

请为用户合成最终回复：`

  const { content } = await llmChat(config, systemPrompt, userMessage)
  return content
}
