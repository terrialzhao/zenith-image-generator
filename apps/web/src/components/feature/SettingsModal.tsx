import { DEFAULT_OPTIMIZE_SYSTEM_PROMPT, type ModelConfig } from '@z-image/shared'
import { RotateCcw, Settings, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  getLLMModels,
  LLM_PROVIDER_OPTIONS,
  type LLMProviderType,
  type LLMSettings,
  PROVIDER_CONFIGS,
  PROVIDER_OPTIONS,
  type ProviderType,
} from '@/lib/constants'
import { getTokenStats, parseTokens } from '@/lib/tokenRotation'

const SETTINGS_TAB_KEY = 'zenith-settings-tab'

type TabType = 'api' | 'llm'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  provider: ProviderType
  model: string
  currentToken: string
  availableModels: ModelConfig[]
  setProvider: (provider: ProviderType) => void
  setModel: (model: string) => void
  saveToken: (provider: ProviderType, token: string) => void
  llmSettings: LLMSettings
  setLLMProvider: (provider: LLMProviderType) => void
  setLLMModel: (model: string) => void
  setAutoTranslate: (enabled: boolean) => void
  setCustomSystemPrompt: (prompt: string) => void
}

export function SettingsModal({
  isOpen,
  onClose,
  provider,
  model,
  currentToken,
  availableModels,
  setProvider,
  setModel,
  saveToken,
  llmSettings,
  setLLMProvider,
  setLLMModel,
  setAutoTranslate,
  setCustomSystemPrompt,
}: SettingsModalProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem(SETTINGS_TAB_KEY)
    return (saved as TabType) || 'api'
  })

  // Persist tab selection
  useEffect(() => {
    localStorage.setItem(SETTINGS_TAB_KEY, activeTab)
  }, [activeTab])

  // API Config computed values
  const providerConfig = PROVIDER_CONFIGS[provider]
  const tokens = useMemo(() => parseTokens(currentToken), [currentToken])
  const stats = useMemo(() => getTokenStats(provider, tokens), [provider, tokens])
  const isConfigured = !providerConfig.requiresAuth || tokens.length > 0

  // LLM Config computed values
  const llmModels = getLLMModels(llmSettings.llmProvider)
  const hasCustomPrompt = (llmSettings.customSystemPrompt ?? '').trim() !== ''

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-zinc-100 font-medium">{t('apiConfig.settings')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'api'
                ? 'text-orange-400 border-b-2 border-orange-400 bg-zinc-800/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('apiConfig.title')}</span>
            {isConfigured && <span className="w-2 h-2 bg-green-500 rounded-full" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('llm')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'llm'
                ? 'text-orange-400 border-b-2 border-orange-400 bg-zinc-800/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>LLM</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'api' && (
            <div className="space-y-4">
              {/* Provider Selection */}
              <div>
                <Label className="text-zinc-400 text-xs">{t('apiConfig.provider')}</Label>
                <Select value={provider} onValueChange={(v) => setProvider(v as ProviderType)}>
                  <SelectTrigger className="mt-1 bg-zinc-950 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900/70 backdrop-blur-md border-zinc-700 text-white">
                    {PROVIDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                        {!opt.requiresAuth && (
                          <span className="ml-2 text-xs text-green-500">{t('apiConfig.free')}</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Selection */}
              <div>
                <Label className="text-zinc-400 text-xs">{t('apiConfig.model')}</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="mt-1 bg-zinc-950 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900/70 backdrop-blur-md border-zinc-700 text-white">
                    {availableModels.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Token Input */}
              <div>
                <Label className="text-zinc-400 text-xs">
                  {t('apiConfig.token', { provider: providerConfig.name })}
                  {!providerConfig.requiresAuth && ` ${t('apiConfig.optional')}`}
                </Label>
                <Input
                  type="password"
                  placeholder={
                    providerConfig.requiresAuth
                      ? t('apiConfig.tokenPlaceholder', { provider: providerConfig.name })
                      : t('apiConfig.optionalQuota')
                  }
                  value={currentToken}
                  onChange={(e) => saveToken(provider, e.target.value)}
                  onBlur={(e) => saveToken(provider, e.target.value)}
                  className="mt-1 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                />
                <p className="mt-1 text-[10px] text-zinc-500">{t('apiConfig.multiTokenHint')}</p>
              </div>

              {/* Token Stats */}
              {stats.total > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-500">{t('apiConfig.tokenStats')}:</span>
                  <span className="text-zinc-400">
                    {t('apiConfig.totalTokens', { count: stats.total })}
                  </span>
                  <span className="text-green-500">
                    {t('apiConfig.activeTokens', { count: stats.active })}
                  </span>
                  {stats.exhausted > 0 && (
                    <span className="text-red-400">
                      {t('apiConfig.exhaustedTokens', { count: stats.exhausted })}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'llm' && (
            <div className="space-y-4">
              {/* LLM Provider Selection */}
              <div>
                <Label className="text-zinc-400 text-xs">LLM Provider</Label>
                <Select
                  value={llmSettings.llmProvider}
                  onValueChange={(v) => setLLMProvider(v as LLMProviderType)}
                >
                  <SelectTrigger className="mt-1 bg-zinc-950 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900/70 backdrop-blur-md border-zinc-700 text-white">
                    {LLM_PROVIDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                        {!opt.needsAuth && (
                          <span className="ml-2 text-xs text-green-500">(Free)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* LLM Model Selection */}
              <div>
                <Label className="text-zinc-400 text-xs">LLM Model</Label>
                <Select value={llmSettings.llmModel} onValueChange={setLLMModel}>
                  <SelectTrigger className="mt-1 bg-zinc-950 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900/70 backdrop-blur-md border-zinc-700 text-white">
                    {llmModels.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                        {m.description && (
                          <span className="ml-2 text-xs text-zinc-500">- {m.description}</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Auto-Translate Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300 text-sm">Auto-Translate</Label>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    Automatically translate Chinese prompts to English
                  </p>
                </div>
                <Switch
                  checked={llmSettings.autoTranslate}
                  onCheckedChange={setAutoTranslate}
                  className="data-[state=unchecked]:[&>span]:bg-zinc-500 data-[state=checked]:[&>span]:bg-blue-500"
                />
              </div>

              {/* Custom System Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-zinc-400 text-xs">
                    Custom System Prompt
                    {hasCustomPrompt && <span className="ml-2 text-purple-400">(Custom)</span>}
                  </Label>
                  {hasCustomPrompt && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomSystemPrompt('')}
                      className="h-6 px-2 text-zinc-500 hover:text-zinc-300"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
                <Textarea
                  rows={4}
                  value={llmSettings.customSystemPrompt}
                  onChange={(e) => setCustomSystemPrompt(e.target.value)}
                  placeholder={`${DEFAULT_OPTIMIZE_SYSTEM_PROMPT.slice(0, 200)}...`}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 resize-none text-xs"
                />
                <p className="text-zinc-600 text-xs mt-1">
                  Leave empty to use the default system prompt. The language instruction will be
                  appended automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
