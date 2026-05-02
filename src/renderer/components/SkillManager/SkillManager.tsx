import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { SkillDef } from '../../../core/types'
import { X, Puzzle, FolderPlus } from 'lucide-react'

const SkillManager: React.FC = () => {
  const { skills, setSkills } = useAppStore()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const init = async () => {
      const s = await window.omniflow.getSkills()
      setSkills(s)
    }
    init()
  }, [])

  const handleAddPath = async () => {
    const dir = await window.omniflow.selectWorkDir()
    if (dir) {
      const updated = await window.omniflow.addSkillPath(dir)
      setSkills(updated)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-1.5 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-surface-200 transition-colors"
        title="Skills"
      >
        <Puzzle size={16} />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl w-[500px] max-h-[70vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-surface-800">
              <h2 className="text-lg font-semibold text-surface-100">Skill 管理</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-surface-200">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={handleAddPath}
                className="w-full py-2.5 border border-dashed border-surface-700 rounded-xl text-sm text-surface-400 hover:text-surface-200 hover:border-surface-500 transition-colors flex items-center justify-center gap-2"
              >
                <FolderPlus size={16} />
                添加 Skill 目录
              </button>

              {skills.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-4">
                  暂无安装的 Skill。兼容 OpenCode Skill 格式，将包含 SKILL.md 的目录添加到 Skill 目录即可。
                </p>
              ) : (
                <div className="space-y-2">
                  {skills.map((skill: SkillDef, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-surface-800 border border-surface-700">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-surface-200">{skill.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 font-medium">
                          v{skill.version}
                        </span>
                      </div>
                      <p className="text-xs text-surface-500 mb-2">{skill.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-surface-700 text-surface-400">
                          Agent: {skill.agentType}
                        </span>
                        {skill.triggers.map((t: string, j: number) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-surface-700 text-surface-500">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SkillManager
