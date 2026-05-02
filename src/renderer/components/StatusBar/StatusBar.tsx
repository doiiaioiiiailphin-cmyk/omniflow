import React from 'react'
import { useAppStore } from '../../stores/appStore'
import Settings from '../Settings/Settings'
import SkillManager from '../SkillManager/SkillManager'
import { GitBranch, Cpu, Folder, Shield } from 'lucide-react'

const StatusBar: React.FC = () => {
  const { isRunning, activeLlmConfig, workDir, messages } = useAppStore()

  return (
    <div className="h-7 bg-surface-900 border-t border-surface-800 flex items-center px-4 text-xs text-surface-500 select-none shrink-0">
      <div className="flex items-center gap-1">
        <Folder size={12} />
        <span className="max-w-[200px] truncate">{workDir || '未选择目录'}</span>
      </div>

      <div className="flex items-center gap-1 ml-4">
        <GitBranch size={12} />
        <span>{messages.length} 条消息</span>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {activeLlmConfig ? (
          <>
            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`} />
            <Cpu size={12} />
            <span>{activeLlmConfig.provider}/{activeLlmConfig.model}</span>
            {!activeLlmConfig.apiKey && (
              <span className="text-amber-500 ml-1">(未配置 Key)</span>
            )}
          </>
        ) : (
          <span className="text-amber-500">未选择模型</span>
        )}
      </div>

      <div className="flex items-center gap-1 ml-4">
        <SkillManager />
        <Settings />
      </div>
    </div>
  )
}

export default StatusBar
