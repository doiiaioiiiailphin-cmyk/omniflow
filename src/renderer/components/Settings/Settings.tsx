import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { MODEL_PRESETS, getDefaultConfig } from '../../../core/llm/model-presets'
import type { LLMConfig, AppSettings } from '../../../core/types'
import { X, Plus, Key, Globe, Trash2, Check, Settings as SettingsIcon } from 'lucide-react'

const Settings: React.FC = () => {
  const { settings, setSettings, llmConfigs, setLlmConfigs, activeLlmConfig, setActiveLlmConfig } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [editingConfig, setEditingConfig] = useState<LLMConfig | null>(null)

  useEffect(() => {
    const init = async () => {
      const s = await window.omniflow.getSettings()
      setSettings(s)
      setLlmConfigs(s.llmConfigs)
      if (s.defaultLLMConfigId) {
        const active = s.llmConfigs.find(c => (c.provider + ':' + c.model) === s.defaultLLMConfigId)
        if (active) setActiveLlmConfig(active)
      }
    }
    init()
  }, [])

  const handleAddConfig = () => {
    if (!selectedProvider || !selectedModel || !apiKey) return

    const config = getDefaultConfig(selectedProvider, selectedModel)
    config.apiKey = apiKey
    if (baseUrl) config.baseUrl = baseUrl

    const newConfigs = [...llmConfigs.filter(c => !(c.provider === config.provider && c.model === config.model)), config]
    setLlmConfigs(newConfigs)
    
    const newSettings: AppSettings = {
      ...settings!,
      llmConfigs: newConfigs,
      defaultLLMConfigId: config.provider + ':' + config.model,
    }
    setSettings(newSettings)
    setActiveLlmConfig(config)
    window.omniflow.addLlmConfig(config)

    resetForm()
    setShowModal(false)
  }

  const handleRemoveConfig = (config: LLMConfig) => {
    const newConfigs = llmConfigs.filter(c => !(c.provider === config.provider && c.model === config.model))
    setLlmConfigs(newConfigs)
    if (activeLlmConfig?.provider === config.provider && activeLlmConfig?.model === config.model) {
      setActiveLlmConfig(newConfigs[0] || null)
    }
    window.omniflow.removeLlmConfig(config.provider, config.model)
  }

  const handleSelectConfig = (config: LLMConfig) => {
    setActiveLlmConfig(config)
    const newSettings: AppSettings = {
      ...settings!,
      defaultLLMConfigId: config.provider + ':' + config.model,
    }
    setSettings(newSettings)
    window.omniflow.saveSettings(newSettings)
  }

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    setSelectedModel('')
    const preset = MODEL_PRESETS.find(p => p.provider === provider)
    const cfg = getDefaultConfig(provider, preset?.models[0]?.id || '')
    setBaseUrl(cfg.baseUrl || '')
  }

  const resetForm = () => {
    setSelectedProvider('')
    setSelectedModel('')
    setApiKey('')
    setBaseUrl('')
    setEditingConfig(null)
  }

  const currentProviderModels = MODEL_PRESETS.find(p => p.provider === selectedProvider)?.models || []

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="p-1.5 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-surface-200 transition-colors"
        title="Settings"
      >
        <SettingsIcon size={16} />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-surface-800">
              <h2 className="text-lg font-semibold text-surface-100">设置</h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="p-1 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-surface-200">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Configured Models */}
              <div>
                <h3 className="text-sm font-semibold text-surface-300 mb-3">已配置的模型</h3>
                {llmConfigs.length === 0 ? (
                  <p className="text-sm text-surface-500">暂无配置，请添加模型</p>
                ) : (
                  <div className="space-y-2">
                    {llmConfigs.map((config, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          activeLlmConfig?.provider === config.provider && activeLlmConfig?.model === config.model
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-surface-700 bg-surface-800 hover:border-surface-600'
                        }`}
                        onClick={() => handleSelectConfig(config)}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-surface-200">
                            {config.provider.toUpperCase()} / {config.model}
                          </div>
                          <div className="text-xs text-surface-500 mt-0.5">
                            API Key: {config.apiKey.slice(0, 4)}****{config.apiKey.slice(-4)}
                            {config.baseUrl && ` | ${config.baseUrl}`}
                          </div>
                        </div>
                        {activeLlmConfig?.provider === config.provider && activeLlmConfig?.model === config.model && (
                          <Check size={16} className="text-primary-400" />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveConfig(config) }}
                          className="p-1 hover:bg-surface-600 rounded text-surface-500 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Model */}
              <div className="border-t border-surface-800 pt-6">
                <h3 className="text-sm font-semibold text-surface-300 mb-3">添加新模型</h3>

                {/* Provider */}
                <div className="mb-4">
                  <label className="text-xs text-surface-500 mb-1.5 block">服务商</label>
                  <div className="grid grid-cols-3 gap-2">
                    {MODEL_PRESETS.map(p => (
                      <button
                        key={p.provider}
                        onClick={() => handleProviderChange(p.provider)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          selectedProvider === p.provider
                            ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                            : 'border-surface-700 bg-surface-800 text-surface-400 hover:border-surface-600'
                        }`}
                      >
                        {p.provider.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model */}
                {selectedProvider && (
                  <div className="mb-4">
                    <label className="text-xs text-surface-500 mb-1.5 block">模型</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {currentProviderModels.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedModel(m.id)}
                          className={`px-3 py-2 rounded-lg text-xs border transition-colors text-left ${
                            selectedModel === m.id
                              ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                              : 'border-surface-700 bg-surface-800 text-surface-400 hover:border-surface-600'
                          }`}
                        >
                          <div className="font-medium">{m.name}</div>
                          <div className="text-surface-600 text-[10px] mt-0.5">{m.contextWindow / 1000}k context</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* API Key */}
                <div className="mb-4">
                  <label className="text-xs text-surface-500 mb-1.5 flex items-center gap-1.5">
                    <Key size={12} /> API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Base URL */}
                <div className="mb-4">
                  <label className="text-xs text-surface-500 mb-1.5 flex items-center gap-1.5">
                    <Globe size={12} /> Base URL (可选)
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={e => setBaseUrl(e.target.value)}
                    placeholder={getDefaultConfig(selectedProvider, '').baseUrl || 'https://'}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <button
                  onClick={handleAddConfig}
                  disabled={!selectedProvider || !selectedModel || !apiKey}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-700 disabled:text-surface-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  添加模型配置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Settings
