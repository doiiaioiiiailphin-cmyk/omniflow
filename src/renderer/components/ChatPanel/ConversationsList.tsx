import React, { useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { MessageSquare, Plus, Trash2, Edit3 } from 'lucide-react'

const ConversationsList: React.FC = () => {
  const { conversations, setConversations, currentConversationId, switchConversation, newConversation } = useAppStore()

  useEffect(() => {
    const load = async () => {
      const convs = await window.omniflow.loadConversations()
      setConversations(convs)
      if (convs.length > 0 && !currentConversationId) {
        switchConversation(convs[0].id)
      }
    }
    load()
  }, [])

  const handleNew = () => {
    newConversation()
  }

  return (
    <div className="h-full flex flex-col bg-surface-950">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-800 shrink-0">
        <span className="text-xs font-medium text-surface-300">对话</span>
        <button
          onClick={handleNew}
          className="p-1 hover:bg-surface-700 rounded text-surface-400 hover:text-surface-200 transition-colors"
          title="新建对话"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {conversations.length === 0 && (
          <p className="text-xs text-surface-600 px-3 py-4 text-center">暂无对话</p>
        )}
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => switchConversation(conv.id)}
            className={`mx-1 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              conv.id === currentConversationId
                ? 'bg-primary-500/10 border border-primary-500/30'
                : 'hover:bg-surface-800 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={12} className={
                conv.id === currentConversationId ? 'text-primary-400' : 'text-surface-500'
              } />
              <span className={`text-xs truncate flex-1 ${
                conv.id === currentConversationId ? 'text-surface-200' : 'text-surface-400'
              }`}>
                {conv.title || '新对话'}
              </span>
            </div>
            <p className="text-[10px] text-surface-600 mt-0.5 truncate">
              {conv.messages.length} 条消息
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConversationsList
