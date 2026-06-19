import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { PERSONAS, WAYPOINTS, Problem, PersonaData } from '../data/simulation'
import { PERSONA_SYSTEM_PROMPTS, PERSONA_EMOJIS, PERSONA_SEVERITY } from '../data/personaPrompts'
import {
  OLLAMA_URL,
  OLLAMA_MODEL,
  OLLAMA_OPTIONS,
  READING_TIME,
  PAUSE_BETWEEN,
  CONVERSATION_HISTORY_LIMIT,
} from '../config/ollama'

export type CharacterBehavior = 'sitting' | 'walking' | 'talking' | 'frustrated' | 'meeting' | 'coffee' | 'listening'

export interface CharacterState {
  persona: PersonaData
  position: THREE.Vector3
  target: THREE.Vector3
  behavior: CharacterBehavior
  speech: string | null
  speechExpiry: number
  facingAngle: number
  isThinking: boolean
}

export interface SimState {
  characters: Record<string, CharacterState>
  problems: Problem[]
  time: number
  speed: number
}

interface ConvEntry {
  name: string
  text: string
}

// ── Ollama call ───────────────────────────────────────────────────────────────

async function callOllama(personaId: string, history: ConvEntry[]): Promise<string> {
  const systemPrompt = PERSONA_SYSTEM_PROMPTS[personaId] ?? ''
  const persona = PERSONAS.find((p) => p.id === personaId)!

  const historyText =
    history.length > 0
      ? `[Cuộc họp đang diễn ra, các câu vừa nói:]\n${history.map((h) => `${h.name}: "${h.text}"`).join('\n')}\n\n`
      : '[Cuộc họp vừa bắt đầu, chưa ai nói gì.]\n\n'

  const userMsg = `${historyText}Cả phòng đang im lặng chờ ${persona.name} nói. ${persona.name} đáp lại gì?`

  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg },
      ],
      stream: false,
      think: false, // top-level param disables Qwen3 thinking mode
      options: OLLAMA_OPTIONS,
    }),
  })

  if (!res.ok) throw new Error(`Ollama ${res.status}`)

  const data = await res.json()
  let text: string = data.message?.content ?? ''
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  text = text.replace(/^["'"']+|["'"']+$/g, '').trim()
  // Strip a leading "Name:" if the model added one
  text = text.replace(new RegExp(`^${persona.name}\\s*[:：-]\\s*`, 'i'), '').trim()
  return text
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deskTarget(personaId: string): THREE.Vector3 {
  return (WAYPOINTS as Record<string, THREE.Vector3>)[`${personaId}_desk`]
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function initialState(): SimState {
  const characters: Record<string, CharacterState> = {}
  for (const p of PERSONAS) {
    const desk = deskTarget(p.id)
    characters[p.id] = {
      persona: p,
      position: desk.clone(),
      target: desk.clone(),
      behavior: 'sitting',
      speech: null,
      speechExpiry: 0,
      facingAngle: Math.PI,
      isThinking: false,
    }
  }
  return { characters, problems: [], time: 0, speed: 1 }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSimulation() {
  const [state, setState] = useState<SimState>(initialState)
  const [generation, setGeneration] = useState(0)
  const stateRef = useRef<SimState>(initialState())
  const lastTickRef = useRef<number>(performance.now())
  const convHistoryRef = useRef<ConvEntry[]>([])
  const recentSpeakersRef = useRef<string[]>([])
  const runIdRef = useRef(0)

  // ── Apply a partial patch across many characters at once ──
  const applyState = useCallback((mutator: (chars: Record<string, CharacterState>) => void, newProblem?: Problem) => {
    const s = stateRef.current
    const chars: Record<string, CharacterState> = {}
    for (const id of Object.keys(s.characters)) chars[id] = { ...s.characters[id] }
    mutator(chars)
    const updated: SimState = {
      ...s,
      characters: chars,
      problems: newProblem ? [...s.problems.slice(-49), newProblem] : s.problems,
    }
    stateRef.current = updated
    setState({ ...updated })
  }, [])

  // ── Pick who speaks next: never the same twice, favor those silent longest ──
  const pickNextSpeaker = useCallback((): string => {
    const ids = PERSONAS.map((p) => p.id)
    const recent = recentSpeakersRef.current
    const last = recent[recent.length - 1]

    const weights = ids.map((id) => {
      if (id === last) return 0 // never speak twice in a row
      const idx = recent.lastIndexOf(id)
      if (idx === -1) return 4 // hasn't spoken in window — most likely
      const recency = recent.length - idx // 1 = just spoke
      return Math.max(1, recency) // longer since spoke → higher weight
    })

    const total = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    for (let i = 0; i < ids.length; i++) {
      r -= weights[i]
      if (r <= 0) return ids[i]
    }
    return ids[0]
  }, [])

  // ── Make all listeners turn to face the speaker ──
  const faceTowardSpeaker = useCallback((chars: Record<string, CharacterState>, speakerId: string) => {
    const sp = chars[speakerId].position
    for (const id of Object.keys(chars)) {
      if (id === speakerId) continue
      const lp = chars[id].position
      const dx = sp.x - lp.x
      const dz = sp.z - lp.z
      chars[id].facingAngle = Math.atan2(dx, dz)
      chars[id].behavior = 'listening'
      chars[id].isThinking = false
    }
  }, [])

  // ── The single conversation loop ──────────────────────────────────────────
  useEffect(() => {
    runIdRef.current += 1
    const myRun = runIdRef.current

    async function conversationLoop() {
      // brief settle before first line
      await sleep(1500)

      while (runIdRef.current === myRun) {
        const speakerId = pickNextSpeaker()
        const persona = PERSONAS.find((p) => p.id === speakerId)!

        // 1) Everyone goes quiet; speaker starts thinking, others face & listen
        applyState((chars) => {
          chars[speakerId].isThinking = true
          chars[speakerId].behavior = 'sitting'
          chars[speakerId].speech = null
          faceTowardSpeaker(chars, speakerId)
        })

        // 2) Generate the line (this latency IS the "thinking carefully" beat)
        let text = ''
        try {
          text = await callOllama(speakerId, convHistoryRef.current)
        } catch (err) {
          console.warn(`[${speakerId}] Ollama error:`, err)
          applyState((chars) => {
            chars[speakerId].isThinking = false
          })
          await sleep(8000)
          continue
        }
        if (runIdRef.current !== myRun) break
        if (!text) {
          applyState((chars) => {
            chars[speakerId].isThinking = false
          })
          continue
        }

        // 3) Record into shared memory so everyone "remembers"
        convHistoryRef.current = [
          ...convHistoryRef.current.slice(-(CONVERSATION_HISTORY_LIMIT - 1)),
          { name: persona.name, text },
        ]
        recentSpeakersRef.current = [...recentSpeakersRef.current.slice(-6), speakerId]

        const emoji = PERSONA_EMOJIS[speakerId] ?? '💬'
        const problem: Problem = {
          id: `${Date.now()}-${speakerId}`,
          timestamp: stateRef.current.time,
          who: speakerId,
          personaName: persona.name,
          role: persona.role,
          color: persona.color,
          message: text,
          severity: PERSONA_SEVERITY[speakerId] ?? 'medium',
          emoji,
        }

        // 4) Speaker talks; everyone else stays listening
        applyState((chars) => {
          chars[speakerId].isThinking = false
          chars[speakerId].behavior = 'talking'
          chars[speakerId].speech = `${emoji} ${text}`
          chars[speakerId].facingAngle = Math.PI // face the room/camera while talking
        }, problem)

        // 5) Hold the line up long enough for everyone to read & absorb
        const readMs = Math.min(
          READING_TIME.max,
          Math.max(READING_TIME.min, text.length * READING_TIME.perChar),
        )
        await sleep(readMs)
        if (runIdRef.current !== myRun) break

        // 6) Clear the bubble, brief reflective silence before next person
        applyState((chars) => {
          chars[speakerId].speech = null
          chars[speakerId].behavior = 'sitting'
        })
        await sleep(randomBetween(PAUSE_BETWEEN.min, PAUSE_BETWEEN.max))
      }
    }

    conversationLoop()

    return () => {
      runIdRef.current += 1 // invalidate this loop
    }
  }, [applyState, pickNextSpeaker, faceTowardSpeaker, generation])

  // ── Animation tick (smooth motion + time) ─────────────────────────────────
  useEffect(() => {
    let rafId: number

    function tick() {
      const now = performance.now()
      const rawDelta = (now - lastTickRef.current) / 1000
      lastTickRef.current = now
      const delta = Math.min(rawDelta, 0.1) * stateRef.current.speed

      const s = stateRef.current
      const newTime = s.time + delta

      const updatedChars = { ...s.characters }
      let anyChange = false

      for (const id of Object.keys(updatedChars)) {
        const ch = { ...updatedChars[id] }
        const dist = ch.position.distanceTo(ch.target)
        if (dist > 0.12) {
          const dir = ch.target.clone().sub(ch.position).normalize()
          ch.position = ch.position.clone().add(dir.multiplyScalar(delta * 2.5))
          ch.behavior = 'walking'
          anyChange = true
        }
        updatedChars[id] = ch
      }

      const newState: SimState = { ...s, time: newTime, characters: anyChange ? updatedChars : s.characters }
      stateRef.current = newState
      setState(newState)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const setSpeed = useCallback((speed: number) => {
    stateRef.current = { ...stateRef.current, speed }
    setState((s) => ({ ...s, speed }))
  }, [])

  const reset = useCallback(() => {
    convHistoryRef.current = []
    recentSpeakersRef.current = []
    const fresh = initialState()
    stateRef.current = fresh
    setState(fresh)
    setGeneration((g) => g + 1) // re-runs the conversation effect → fresh loop
  }, [])

  return { state, setSpeed, reset }
}
