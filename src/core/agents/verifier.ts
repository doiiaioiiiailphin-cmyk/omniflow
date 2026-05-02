import { LLMConfig, AgentResult } from '../types'
import { llmChat } from '../llm/llm-router'
import { skillRegistry } from '../skill/skill-registry'

export async function runVerifier(config: LLMConfig, task: string, content: string, originalTask: string): Promise<AgentResult> {
  const skillPrompt = skillRegistry.getSkillPrompt('verifier', task)

  const systemPrompt = `你是一个内容校验专家。你的任务是审查生成的内容，检查其质量和准确性。

${skillPrompt}

请以 JSON 格式输出校验结果：
\`\`\`json
{
  "passed": true|false,
  "score": 1-10,
  "issues": [
    {
      "severity": "critical|major|minor",
      "description": "问题描述",
      "suggestion": "改进建议"
    }
  ],
  "summary": "校验总结"
}
\`\`\`

规则：
1. 检查是否完整覆盖了原任务要求
2. 检查内容的准确性、一致性和逻辑性
3. 检查格式是否符合要求
4. 识别潜在的遗漏或错误
5. 评分低于6分表明需要重新生成`

  const userMessage = `原始任务：${originalTask}\n\n待校验内容：\n${content}\n\n请校验。`

  const { content: result, tokens, duration } = await llmChat(config, systemPrompt, userMessage)

  return {
    agentType: 'verifier',
    output: result,
    tokens,
    duration,
  }
}
