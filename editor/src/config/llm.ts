// Bộ não LLM: Ollama (local), Claude (Anthropic API, trả phí), hoặc Gemini (Google
// AI Studio — có free tier thật, không cần nạp tiền). Key lưu trong localStorage máy bạn.

export type Provider = 'ollama' | 'claude' | 'gemini'

export interface LLMConfig {
  provider: Provider
  claudeApiKey: string
  claudeModel: string
  geminiApiKey: string
  geminiModel: string
}

const KEY = 'bomtan_llm_v1'

export const CLAUDE_MODELS: { id: string; label: string }[] = [
  { id: 'claude-opus-4-8', label: 'Opus 4.8 (thông minh nhất, đắt)' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6 (cân bằng)' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 (nhanh & rẻ nhất)' },
]

export const GEMINI_MODELS: { id: string; label: string }[] = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (khôn, free)' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite (nhanh hơn)' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (dự phòng)' },
]

const DEFAULT: LLMConfig = {
  provider: 'ollama',
  claudeApiKey: '',
  claudeModel: 'claude-opus-4-8',
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
}

export function getLLMConfig(): LLMConfig {
  if (typeof window === 'undefined') return { ...DEFAULT }
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '{}')
    const provider: Provider = d.provider === 'claude' || d.provider === 'gemini' ? d.provider : 'ollama'
    return {
      provider,
      claudeApiKey: typeof d.claudeApiKey === 'string' ? d.claudeApiKey : '',
      claudeModel: typeof d.claudeModel === 'string' && d.claudeModel ? d.claudeModel : 'claude-opus-4-8',
      geminiApiKey: typeof d.geminiApiKey === 'string' ? d.geminiApiKey : '',
      geminiModel: typeof d.geminiModel === 'string' && d.geminiModel ? d.geminiModel : 'gemini-2.0-flash',
    }
  } catch {
    return { ...DEFAULT }
  }
}

export function setLLMConfig(c: LLMConfig) {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(c))
}
