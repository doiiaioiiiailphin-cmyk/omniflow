import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { generateId } from '../../../core/utils'
import type { Message, DAGExecution } from '../../../core/types'
import { Send, Loader2, Bot, User, GitBranch } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const ChatPanel: React.FC = () => {
  const { messages, addMessage, isRunning, setRunning, setCurrentDAG, activeLlmConfig, currentConversationId } = useAppStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const cleanup = window.omniflow.onTaskProgress((progress) => {
      setCurrentDAG(progress as DAGExecution)
    })
    return cleanup
  }, [])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isRunning || !activeLlmConfig || !currentConversationId) return
    if (!activeLlmConfig.apiKey) {
      const msg: Message = {
        id: generateId(),
        role: 'assistant',
        content: '请先在设置中配置 API Key。',
        timestamp: Date.now(),
      }
      addMessage(msg)
      return
    }

    setInput('')
    setRunning(true)

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    addMessage(userMsg)

    try {
      const result: DAGExecution = await window.omniflow.executeTask(activeLlmConfig, text)

      // Collect final output from generator nodes
      const finalOutputs = result.nodes
        .filter(n => (n.agentType === 'generator') && n.result)
        .map(n => `## ${n.task}\n\n${n.result?.output}`)
        .join('\n\n')

      const displayedOutput = finalOutputs || result.nodes
        .filter(n => n.result)
        .map(n => `### [${n.agentType}] ${n.task}\n\n${n.result?.output}`)
        .join('\n\n') || '任务已完成，但未生成输出内容。'

      const assistantMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: displayedOutput,
        timestamp: Date.now(),
        dagExecutionId: result.id,
      }
      addMessage(assistantMsg)
    } catch (err) {
      const errorMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: `执行出错：${err instanceof Error ? err.message : String(err)}`,
        timestamp: Date.now(),
      }
      addMessage(errorMsg)
    } finally {
      setRunning(false)
      setCurrentDAG(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const notConfigured = !activeLlmConfig || !activeLlmConfig.apiKey

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-surface-500">
            <div className="text-6xl mb-4">
              <Bot size={64} className="text-surface-600" />
            </div>
            <h2 className="text-xl font-semibold text-surface-300 mb-2">OmniFlow</h2>
            <p className="text-sm mb-6">多 Agent 协作，一站式信息处理</p>
            <div className="grid grid-cols-2 gap-2 max-w-md">
              {[
                '整理一份项目进度报告',
                '分析这份合同的风险点',
                '总结这篇文章的核心观点并扩展',
                '搜索并归纳最新行业趋势'
              ].map((hint, i) => (
                <button
                  key={i}
                  onClick={() => setInput(hint)}
                  className="text-xs text-left p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div
                className={`rounded-xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-800 text-surface-100 border border-surface-700'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              {msg.dagExecutionId && (
                <div className="flex items-center gap-1 mt-1 text-xs text-surface-500">
                  <GitBranch size={10} />
                  <span>DAG 工作流完成</span>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center shrink-0 mt-1">
                <User size={14} className="text-surface-300" />
              </div>
            )}
          </div>
        ))}

        {isRunning && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shrink-0 mt-1">
              <Loader2 size={14} className="text-white animate-spin" />
            </div>
            <div className="bg-surface-800 rounded-xl px-4 py-3 border border-surface-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-surface-400">Agent 协作中...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-surface-800 shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={notConfigured ? '请先在右上角设置中配置模型和 API Key...' : '输入任务描述，回车发送...'}
            rows={2}
            disabled={isRunning || notConfigured}
            className="flex-1 bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder-surface-500 resize-none focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isRunning || !input.trim() || notConfigured}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-700 disabled:text-surface-500 text-white rounded-xl transition-colors flex items-center gap-2 shrink-0"
          >
            {isRunning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        {notConfigured && (
          <p className="text-xs text-amber-500 mt-2">未配置模型或 API Key，请点击右上角齿轮图标进入设置。</p>
        )}
      </div>
    </div>
  )
}

export default ChatPanel
