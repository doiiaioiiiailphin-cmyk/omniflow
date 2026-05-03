import { ipcMain, dialog, app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { LLMConfig, AppSettings, FileItem, Conversation } from '../types'
import { executeTask } from '../dag/task-runner'
import { skillRegistry } from '../skill/skill-registry'
import { DAGExecution } from '../types'

let settings: AppSettings = loadSettings()

function getSettingsPath(): string {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'omniflow-settings.json')
}

function loadSettings(): AppSettings {
  const p = getSettingsPath()
  try {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'))
    }
  } catch { /* use defaults */ }

  return {
    workDir: app.getPath('home'),
    llmConfigs: [],
    defaultLLMConfigId: '',
    maxRetries: 3,
    theme: 'dark',
    language: 'zh-CN',
    skillsPath: [],
  }
}

function saveSettings(): void {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8')
}

export function registerIpcHandlers(): void {
  // Settings
  ipcMain.handle('get-settings', () => settings)
  ipcMain.handle('save-settings', (_event, newSettings: AppSettings) => {
    settings = newSettings
    saveSettings()
    return true
  })

  // LLM Config
  ipcMain.handle('add-llm-config', (_event, config: LLMConfig) => {
    settings.llmConfigs.push(config)
    if (!settings.defaultLLMConfigId) {
      settings.defaultLLMConfigId = config.provider + ':' + config.model
    }
    saveSettings()
    return config
  })

  ipcMain.handle('remove-llm-config', (_event, provider: string, model: string) => {
    settings.llmConfigs = settings.llmConfigs.filter(c => !(c.provider === provider && c.model === model))
    if (settings.defaultLLMConfigId === provider + ':' + model) {
      settings.defaultLLMConfigId = settings.llmConfigs[0]?.provider + ':' + settings.llmConfigs[0]?.model || ''
    }
    saveSettings()
    return true
  })

  // Work directory
  ipcMain.handle('select-work-dir', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (!result.canceled && result.filePaths.length > 0) {
      settings.workDir = result.filePaths[0]
      saveSettings()
      return settings.workDir
    }
    return settings.workDir
  })

  ipcMain.handle('get-work-dir', () => settings.workDir)

  // File tree
  ipcMain.handle('get-file-tree', (_event, dirPath: string) => {
    return readFileTree(dirPath)
  })

  ipcMain.handle('read-file', (_event, filePath: string) => {
    return fs.readFileSync(filePath, 'utf-8')
  })

  ipcMain.handle('write-file', (_event, filePath: string, content: string) => {
    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  })

  // Conversations
  ipcMain.handle('save-conversation', (_event, conversation: Conversation) => {
    const convPath = path.join(settings.workDir, '.omniflow', 'conversations')
    if (!fs.existsSync(convPath)) {
      fs.mkdirSync(convPath, { recursive: true })
    }
    fs.writeFileSync(
      path.join(convPath, `${conversation.id}.json`),
      JSON.stringify(conversation, null, 2),
      'utf-8'
    )
    return true
  })

  ipcMain.handle('load-conversations', () => {
    const convPath = path.join(settings.workDir, '.omniflow', 'conversations')
    if (!fs.existsSync(convPath)) return []

    const files = fs.readdirSync(convPath).filter(f => f.endsWith('.json'))
    return files.map(f => {
      const data = fs.readFileSync(path.join(convPath, f), 'utf-8')
      try { return JSON.parse(data) } catch { return null }
    }).filter(Boolean).sort((a: Conversation, b: Conversation) => b.updatedAt - a.updatedAt)
  })

  // Task execution
  ipcMain.handle('execute-task', async (event, config: LLMConfig, userTask: string) => {
    const execution = await executeTask(config, userTask, settings.workDir, (progress: DAGExecution) => {
      event.sender.send('task-progress', progress)
    })
    return execution
  })

  // Skills
  ipcMain.handle('get-skills', () => {
    return skillRegistry.getAll()
  })

  ipcMain.handle('add-skill-path', (_event, skillPath: string) => {
    if (!settings.skillsPath.includes(skillPath)) {
      settings.skillsPath.push(skillPath)
      saveSettings()
    }
    skillRegistry.initialize(settings.skillsPath)
    return skillRegistry.getAll()
  })

  ipcMain.handle('init-skills', (_event, paths: string[]) => {
    settings.skillsPath = paths
    saveSettings()
    skillRegistry.initialize(paths)
    return skillRegistry.getAll()
  })
}

function readFileTree(dirPath: string, depth = 3): FileItem[] {
  if (depth <= 0) return []

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    return entries
      .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules')
      .map(e => {
        const itemPath = path.join(dirPath, e.name)
        if (e.isDirectory()) {
          return {
            name: e.name,
            path: itemPath,
            type: 'directory' as const,
            children: readFileTree(itemPath, depth - 1),
          }
        }
        const stat = fs.statSync(itemPath)
        return {
          name: e.name,
          path: itemPath,
          type: 'file' as const,
          size: stat.size,
          modifiedAt: stat.mtimeMs,
        }
      })
      .sort((a, b) => {
        if (a.type === 'directory' && b.type === 'file') return -1
        if (a.type === 'file' && b.type === 'directory') return 1
        return a.name.localeCompare(b.name)
      })
  } catch {
    return []
  }
}
