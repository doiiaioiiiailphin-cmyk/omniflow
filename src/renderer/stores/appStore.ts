import { create } from 'zustand'
import type { AppSettings, Conversation, Message, DAGExecution, SkillDef, FileItem, LLMConfig } from '../../core/types'

interface AppState {
  // Settings
  settings: AppSettings | null
  setSettings: (s: AppSettings) => void

  // Conversations
  conversations: Conversation[]
  currentConversationId: string | null
  messages: Message[]
  setConversations: (c: Conversation[]) => void
  addMessage: (m: Message) => void
  updateMessage: (id: string, content: string) => void
  newConversation: () => void
  switchConversation: (id: string) => void

  // Task execution
  isRunning: boolean
  currentDAG: DAGExecution | null
  setRunning: (v: boolean) => void
  setCurrentDAG: (dag: DAGExecution | null) => void

  // Skills
  skills: SkillDef[]
  setSkills: (s: SkillDef[]) => void

  // File tree
  fileTree: FileItem[]
  workDir: string
  setFileTree: (f: FileItem[]) => void
  setWorkDir: (d: string) => void

  // Panel visibility
  showFileTree: boolean
  showDAG: boolean
  showAgentLog: boolean
  toggleFileTree: () => void
  toggleDAG: () => void
  toggleAgentLog: () => void

  // LLM config
  llmConfigs: LLMConfig[]
  activeLlmConfig: LLMConfig | null
  setLlmConfigs: (c: LLMConfig[]) => void
  setActiveLlmConfig: (c: LLMConfig | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  settings: null,
  setSettings: (s) => set({ settings: s }),

  conversations: [],
  currentConversationId: null,
  messages: [],
  setConversations: (c) => set({ conversations: c }),
  addMessage: (m) => set((state) => ({
    messages: [...state.messages, m],
  })),
  updateMessage: (id, content) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, content } : m),
  })),
  newConversation: () => {
    const id = crypto.randomUUID()
    const conv: Conversation = {
      id,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set((state) => ({
      conversations: [conv, ...state.conversations],
      currentConversationId: id,
      messages: [],
    }))
  },
  switchConversation: (id) => {
    const conv = get().conversations.find(c => c.id === id)
    if (conv) {
      set({
        currentConversationId: id,
        messages: conv.messages,
      })
    }
  },

  isRunning: false,
  currentDAG: null,
  setRunning: (v) => set({ isRunning: v }),
  setCurrentDAG: (dag) => set({ currentDAG: dag }),

  skills: [],
  setSkills: (s) => set({ skills: s }),

  fileTree: [],
  workDir: '',
  setFileTree: (f) => set({ fileTree: f }),
  setWorkDir: (d) => set({ workDir: d }),

  showFileTree: true,
  showDAG: true,
  showAgentLog: false,
  toggleFileTree: () => set((s) => ({ showFileTree: !s.showFileTree })),
  toggleDAG: () => set((s) => ({ showDAG: !s.showDAG })),
  toggleAgentLog: () => set((s) => ({ showAgentLog: !s.showAgentLog })),

  llmConfigs: [],
  activeLlmConfig: null,
  setLlmConfigs: (c) => set({ llmConfigs: c }),
  setActiveLlmConfig: (c) => set({ activeLlmConfig: c }),
}))
