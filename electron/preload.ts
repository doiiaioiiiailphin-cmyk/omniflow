import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: unknown) => ipcRenderer.invoke('save-settings', settings),

  addLlmConfig: (config: unknown) => ipcRenderer.invoke('add-llm-config', config),
  removeLlmConfig: (provider: string, model: string) => ipcRenderer.invoke('remove-llm-config', provider, model),

  selectWorkDir: () => ipcRenderer.invoke('select-work-dir'),
  getWorkDir: () => ipcRenderer.invoke('get-work-dir'),

  getFileTree: (dirPath?: string) => ipcRenderer.invoke('get-file-tree', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),

  saveConversation: (conv: unknown) => ipcRenderer.invoke('save-conversation', conv),
  loadConversations: () => ipcRenderer.invoke('load-conversations'),

  executeTask: (config: unknown, task: string) => ipcRenderer.invoke('execute-task', config, task),
  onTaskProgress: (callback: (progress: unknown) => void) => {
    const handler = (_event: unknown, progress: unknown) => callback(progress)
    ipcRenderer.on('task-progress', handler)
    return () => ipcRenderer.removeListener('task-progress', handler)
  },

  getSkills: () => ipcRenderer.invoke('get-skills'),
  addSkillPath: (skillPath: string) => ipcRenderer.invoke('add-skill-path', skillPath),
  initSkills: (paths: string[]) => ipcRenderer.invoke('init-skills', paths),
}

contextBridge.exposeInMainWorld('omniflow', api)

export type OmniFlowAPI = typeof api
