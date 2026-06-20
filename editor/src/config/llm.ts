// Bộ não LLM: chọn giữa Ollama (local) hoặc Claude (Anthropic API, key của chính bạn).
// Key được lưu trong localStorage của MÁY BẠN, không gửi đi đâu ngoài api.anthropic.com.

export type Provider = 'ollama' | 'claude'

export interface LLMConfig {
  provider: Provider
  claudeApiKey: string
  claudeModel: string
}

const KEY = 'bomtan_llm_v1'

export const CLAUDE_MODELS: { id: string; label: string }[] = [
  { id: 'claude-opus-4-8', label: 'Opus 4.8 (thông minh nhất, đắt)' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6 (cân bằng)' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 (nhanh & rẻ nhất)' },
]

const DEFAULT: LLMConfig = { provider: 'ollama', claudeApiKey: '', claudeModel: 'claude-opus-4-8' }

export function getLLMConfig(): LLMConfig {
  if (typeof window === 'undefined') return { ...DEFAULT }
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      provider: d.provider === 'claude' ? 'claude' : 'ollama',
      claudeApiKey: typeof d.claudeApiKey === 'string' ? d.claudeApiKey : '',
      claudeModel: typeof d.claudeModel === 'string' && d.claudeModel ? d.claudeModel : 'claude-opus-4-8',
    }
  } catch {
    return { ...DEFAULT }
  }
}

export function setLLMConfig(c: LLMConfig) {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(c))
}
