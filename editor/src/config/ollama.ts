export const OLLAMA_URL = 'http://localhost:11434/api/chat'
export const OLLAMA_MODEL = 'qwen3:8b'

export const OLLAMA_OPTIONS = {
  temperature: 0.85,
  num_predict: 120,
  top_p: 0.9,
}

// Turn-based conversation timing
export const READING_TIME = { perChar: 85, min: 4000, max: 10000 } // how long a line stays up so everyone can read
export const PAUSE_BETWEEN = { min: 1800, max: 4000 } // silent gap after a line before next person thinks
export const CONVERSATION_HISTORY_LIMIT = 12 // how many past lines each character "remembers"
