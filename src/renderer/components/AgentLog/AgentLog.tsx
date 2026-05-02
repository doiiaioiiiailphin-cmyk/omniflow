import React from 'react'
import { useAppStore } from '../../stores/appStore'
import { Terminal, Clock } from 'lucide-react'
import { formatDuration } from '../../../core/utils'

const AgentLog: React.FC = () => {
  const { currentDAG } = useAppStore()
  const nodes = currentDAG?.nodes || []

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-surface-500">
        <Terminal size={32} className="text-surface-600 mb-2" />
        <p className="text-sm">Agent 执行日志</p>
        <p className="text-xs mt-1">暂无日志</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-surface-950">
      <div className="h-8 bg-surface-900 border-b border-surface-800 flex items-center px-3 shrink-0">
        <span className="text-xs text-surface-400 font-medium">执行日志</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
        {nodes.map(node => (
          <div
            key={node.id}
            className="px-3 py-2 rounded-lg bg-surface-900 border border-surface-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  node.status === 'completed' ? 'bg-green-500' :
                  node.status === 'running' ? 'bg-green-500 animate-pulse' :
                  node.status === 'failed' ? 'bg-red-500' :
                  'bg-surface-600'
                }`}
              />
              <span className="text-surface-300 font-semibold">{node.agentType}</span>
              <span className="text-surface-600">|</span>
              <span className="text-surface-500 truncate">{node.task}</span>
              <span className="text-surface-600 ml-auto">
                {node.status}
              </span>
            </div>
            {node.result && (
              <div className="text-surface-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {formatDuration(node.result.duration)}
                </span>
                <span>Tokens: ~{node.result.tokens}</span>
              </div>
            )}
            {node.status === 'failed' && node.retryCount > 0 && (
              <div className="text-red-400 mt-1">
                重试次数: {node.retryCount}/{node.maxRetries}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentLog
