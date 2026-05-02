import React, { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { FileItem } from '../../../core/types'
import { Folder, File, ChevronRight, ChevronDown, FolderOpen, RefreshCw } from 'lucide-react'

const FileTreeNode: React.FC<{ item: FileItem; depth: number; onFileClick: (path: string) => void }> = ({ item, depth, onFileClick }) => {
  const [expanded, setExpanded] = useState(depth < 1)

  if (item.type === 'directory') {
    return (
      <div>
        <div
          className="flex items-center gap-1 py-1 px-2 hover:bg-surface-800 rounded cursor-pointer text-surface-400 hover:text-surface-200 transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {expanded ? <FolderOpen size={14} className="text-amber-500" /> : <Folder size={14} className="text-amber-500" />}
          <span className="text-xs truncate">{item.name}</span>
        </div>
        {expanded && item.children?.map(child => (
          <FileTreeNode key={child.path} item={child} depth={depth + 1} onFileClick={onFileClick} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-1 py-1 px-2 hover:bg-surface-800 rounded cursor-pointer text-surface-500 hover:text-surface-300 transition-colors"
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      onClick={() => onFileClick(item.path)}
    >
      <File size={14} />
      <span className="text-xs truncate">{item.name}</span>
    </div>
  )
}

const FileTree: React.FC = () => {
  const { workDir, fileTree, setFileTree, setWorkDir } = useAppStore()
  const [loading, setLoading] = useState(false)

  const loadFileTree = async () => {
    setLoading(true)
    try {
      const tree = await window.omniflow.getFileTree(workDir)
      setFileTree(tree)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const init = async () => {
      const wd = await window.omniflow.getWorkDir()
      setWorkDir(wd)
      loadFileTree()
    }
    init()
  }, [])

  const handleSelectDir = async () => {
    const dir = await window.omniflow.selectWorkDir()
    setWorkDir(dir)
    setTimeout(loadFileTree, 200)
  }

  const handleFileClick = async (filePath: string) => {
    try {
      const content = await window.omniflow.readFile(filePath)
      console.log('File loaded:', filePath)
    } catch { /* ignore */ }
  }

  return (
    <div className="h-full flex flex-col bg-surface-950">
      <div className="h-8 bg-surface-900 border-b border-surface-800 flex items-center justify-between px-3 shrink-0">
        <span className="text-xs text-surface-400 font-medium">文件</span>
        <div className="flex items-center gap-1">
          <button onClick={loadFileTree} className="p-1 hover:bg-surface-700 rounded text-surface-500 hover:text-surface-300">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        <div
          className="flex items-center gap-1 py-1 px-2 hover:bg-surface-800 rounded cursor-pointer text-surface-400 hover:text-surface-200 transition-colors mx-1"
          onClick={handleSelectDir}
        >
          <Folder size={14} className="text-primary-400" />
          <span className="text-xs truncate">{workDir || '选择工作目录...'}</span>
        </div>

        {fileTree.map(item => (
          <FileTreeNode key={item.path} item={item} depth={0} onFileClick={handleFileClick} />
        ))}

        {fileTree.length === 0 && !loading && (
          <p className="text-xs text-surface-600 p-4 text-center">空目录</p>
        )}
      </div>
    </div>
  )
}

export default FileTree
