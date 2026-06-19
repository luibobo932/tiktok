import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { PERSONAS, WAYPOINTS, Problem, PersonaData } from '../data/simulation'
import { PERSONA_SYSTEM_PROMPTS, PERSONA_EMOJIS, PERSONA_SEVERITY } from '../data/personaPrompts'
import {
  OLLAMA_URL,
  OLLAMA_MODEL,
  OLLAMA_OPTIONS,
  SPEAK_INTERVAL_MS,
  CONVERSATION_HISTORY_LIMIT,
} from '../config/ollama'

export type CharacterBehavior = 'sitting' | 'walking' | 'talking' | 'frustrated' | 'meeting' | 'coffee'

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
      ? `[Cuộc trò chuyện vừa rồi:]\n${history.map((h) => `- ${h.name}: "${h.text}"`).join('\n')}\n\n`
      : ''

  const userMsg = `${historyText}Bây giờ ${persona.name} nói gì?`

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
  // Strip Qwen3 thinking blocks
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  // Strip surrounding quotes
  text = text.replace(/^["'"']+|["'"']+$/g, '').trim()
  return text || '...'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deskTarget(personaId: string): THREE.Vector3 {
  return (WAYPOINTS as Record<string, THREE.Vector3>)[`${personaId}_desk`]
}

// 10 seats around the meeting table (center -5.5, 0, -4.5), radius 2.4
const MEETING_SEATS: Record<string, THREE.Vector3> = (() => {
  const cx = -5.5, cz = -4.5, r = 2.4
  const ids = ['tuan', 'huong', 'linh', 'luan', 'mai', 'duc', 'khoa', 'thanhduy', 'tri', 'huy']
  const seats: Record<string, THREE.Vector3> = {}
  ids.forEach((id, i) => {
    const angle = (i / ids.length) * Math.PI * 2
    seats[id] = new THREE.Vector3(cx + Math.sin(angle) * r, 0, cz + Math.cos(angle) * r)
  })
  return seats
})()

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

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
  const stateRef = useRef<SimState>(initialState())
  const lastTickRef = useRef<number>(performance.now())
  const convHistoryRef = useRef<ConvEntry[]>([])
  const aliveRef = useRef(true)

  // ── Mutate stateRef and schedule a re-render ──
  const patchChar = useCallback(
    (id: string, patch: Partial<CharacterState>, newProblem?: Problem) => {
      const s = stateRef.current
      const updated = {
        ...s,
        characters: {
          ...s.characters,
          [id]: { ...s.characters[id], ...patch },
        },
        problems: newProblem
          ? [...s.problems.slice(-49), newProblem]
          : s.problems,
      }
      stateRef.current = updated
      setState({ ...updated })
    },
    [],
  )

  // ── Trigger walk ──────────────────────────────────────────────────────────
  const triggerWalk = useCallback(
    (personaId: string, dest: 'desk' | 'coffee' | 'meeting') => {
      let target: THREE.Vector3
      if (dest === 'desk') target = deskTarget(personaId).clone()
      else if (dest === 'coffee')
        target = WAYPOINTS.coffee
          .clone()
          .add(new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5))
      else target = MEETING_SEATS[personaId]?.clone() ?? WAYPOINTS.meeting.clone()

      patchChar(personaId, { target, behavior: 'walking' })
    },
    [patchChar],
  )

  // ── Trigger speech ────────────────────────────────────────────────────────
  const triggerSpeech = useCallback(
    (personaId: string, text: string) => {
      const persona = PERSONAS.find((p) => p.id === personaId)!
      const emoji = PERSONA_EMOJIS[personaId] ?? '💬'

      convHistoryRef.current = [
        ...convHistoryRef.current.slice(-(CONVERSATION_HISTORY_LIMIT - 1)),
        { name: persona.name, text },
      ]

      const problem: Problem = {
        id: `${Date.now()}-${personaId}`,
        timestamp: stateRef.current.time,
        who: personaId,
        personaName: persona.name,
        role: persona.role,
        color: persona.color,
        message: text,
        severity: PERSONA_SEVERITY[personaId] ?? 'medium',
        emoji,
      }

      patchChar(
        personaId,
        {
          speech: `${emoji} ${text}`,
          speechExpiry: stateRef.current.time + 7,
          behavior: 'talking',
          isThinking: false,
        },
        problem,
      )
    },
    [patchChar],
  )

  // ── Autonomous AI loop for each character ─────────────────────────────────
  useEffect(() => {
    aliveRef.current = true

    async function characterLoop(personaId: string, startDelay: number) {
      await new Promise<void>((r) => setTimeout(r, startDelay))

      while (aliveRef.current) {
        // Show thinking indicator
        patchChar(personaId, { isThinking: true })

        try {
          const text = await callOllama(personaId, convHistoryRef.current)
          if (!aliveRef.current) break
          triggerSpeech(personaId, text)
        } catch (err) {
          console.warn(`[${personaId}] Ollama error:`, err)
          patchChar(personaId, { isThinking: false })
          // Retry after longer delay on error
          await new Promise<void>((r) => setTimeout(r, 20000))
          continue
        }

        // Occasionally walk after speaking
        const rnd = Math.random()
        if (rnd < 0.18) {
          setTimeout(() => triggerWalk(personaId, 'coffee'), 2000)
          setTimeout(() => triggerWalk(personaId, 'desk'), 12000)
        } else if (rnd < 0.30) {
          setTimeout(() => triggerWalk(personaId, 'meeting'), 2000)
          setTimeout(() => triggerWalk(personaId, 'desk'), 15000)
        }

        // Wait before next thought
        const wait = randomBetween(SPEAK_INTERVAL_MS.min, SPEAK_INTERVAL_MS.max)
        await new Promise<void>((r) => setTimeout(r, wait))
      }
    }

    // Stagger start: 0s, 2s, 4s, ... 18s so characters don't all speak at once
    PERSONAS.forEach((p, i) => {
      characterLoop(p.id, i * 2000)
    })

    return () => {
      aliveRef.current = false
    }
  }, [patchChar, triggerSpeech, triggerWalk])

  // ── Animation tick (position + speech expiry) ─────────────────────────────
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
          ch.facingAngle = Math.atan2(dir.x, dir.z)
          ch.behavior = 'walking'
          anyChange = true
        } else if (ch.behavior === 'walking') {
          const atDesk = ch.position.distanceTo(deskTarget(id)) < 0.8
          const atMeeting = ch.position.distanceTo(WAYPOINTS.meeting) < 3.0
          const atCoffee = ch.position.distanceTo(WAYPOINTS.coffee) < 2.5
          ch.behavior = atMeeting ? 'meeting' : atCoffee ? 'coffee' : atDesk ? 'sitting' : 'sitting'
          anyChange = true
        }

        if (ch.speech && newTime > ch.speechExpiry) {
          ch.speech = null
          if (ch.behavior === 'talking') {
            ch.behavior = ch.position.distanceTo(deskTarget(id)) < 1 ? 'sitting' : 'sitting'
          }
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
    aliveRef.current = false
    const fresh = initialState()
    stateRef.current = fresh
    setState(fresh)
    // Restart loops after a brief pause
    setTimeout(() => { aliveRef.current = true }, 100)
  }, [])

  return { state, setSpeed, reset }
}
