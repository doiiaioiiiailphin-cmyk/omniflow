import React from 'react'
import ChatPanel from '../ChatPanel/ChatPanel'
import ConversationsList from '../ChatPanel/ConversationsList'
import DAGFlow from '../DAGFlow/DAGFlow'
import FileTree from '../FileTree/FileTree'
import AgentLog from '../AgentLog/AgentLog'
import StatusBar from '../StatusBar/StatusBar'
import { useAppStore } from '../../stores/appStore'
import { Files, GitBranch, Terminal } from 'lucide-react'

const Layout: React.FC = () => {
  const { showFileTree, showDAG, showAgentLog, toggleFileTree, toggleDAG, toggleAgentLog, isRunning, currentDAG } = useAppStore()

  const shouldShowDAG = showDAG || (isRunning && currentDAG && currentDAG.nodes.length > 0)

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-950">
      {/* Top Bar */}
      <div className="h-10 bg-surface-900 border-b border-surface-800 flex items-center px-4 drag-region select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            O
          </div>
          <span className="text-sm font-semibold text-surface-200">OmniFlow</span>
        </div>

        <div className="flex items-center gap-1 ml-6">
          <button
            onClick={toggleFileTree}
            className={`px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${showFileTree ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-200'}`}
          >
            <Files size={14} />
            文件
          </button>
          <button
            onClick={toggleDAG}
            className={`px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${shouldShowDAG ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-200'}`}
          >
            <GitBranch size={14} />
            工作流
          </button>
          <button
            onClick={toggleAgentLog}
            className={`px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${showAgentLog ? 'bg-surface-700 text-surface-100' : 'text-surface-400 hover:text-surface-200'}`}
          >
            <Terminal size={14} />
            日志
          </button>
        </div>

        {isRunning && (
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400">运行中</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Conversations */}
        <div className="w-52 border-r border-surface-800 shrink-0">
          <ConversationsList />
        </div>

        {/* File Tree (toggleable) */}
        {showFileTree && (
          <div className="w-56 border-r border-surface-800 shrink-0">
            <FileTree />
          </div>
        )}

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatPanel />
        </div>

        {/* DAG Panel (auto-show during task, otherwise toggleable) */}
        {shouldShowDAG && (
          <div className="w-80 border-l border-surface-800 shrink-0">
            <DAGFlow />
          </div>
        )}
      </div>

      {/* Agent Log Bottom Panel */}
      {showAgentLog && (
        <div className="h-48 border-t border-surface-800 shrink-0">
          <AgentLog />
        </div>
      )}

      {/* Status Bar */}
      <StatusBar />
    </div>
  )
}

export default Layout
