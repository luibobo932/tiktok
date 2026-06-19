export const OLLAMA_URL = 'http://localhost:11434/api/chat'
export const OLLAMA_MODEL = 'qwen3:8b'

export const OLLAMA_OPTIONS = {
  temperature: 0.85,
  num_predict: 120,
  top_p: 0.9,
}

export const SPEAK_INTERVAL_MS = { min: 9000, max: 20000 }
export const CONVERSATION_HISTORY_LIMIT = 8
