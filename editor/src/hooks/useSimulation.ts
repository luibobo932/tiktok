import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { PERSONAS, WAYPOINTS, Problem, ActionItem, PersonaData } from '../data/simulation'
import { PERSONA_SYSTEM_PROMPTS, PERSONA_EMOJIS, PERSONA_SEVERITY } from '../data/personaPrompts'
import { AGENDA, SECRETARY_PROMPT, AgendaTopic } from '../data/meetingAgenda'
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
  actionItems: ActionItem[]
  currentTopic: { id: string; title: string } | null
  time: number
  speed: number
}

interface ConvEntry {
  name: string
  text: string
}

// ── Ollama ────────────────────────────────────────────────────────────────────

async function ollamaChat(system: string, user: string, opts: Record<string, unknown> = {}): Promise<string> {
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      stream: false,
      think: false, // top-level param disables Qwen3 thinking mode
      options: { ...OLLAMA_OPTIONS, ...opts },
    }),
  })
  if (!res.ok) throw new Error(`Ollama ${res.status}`)
  const data = await res.json()
  let text: string = data.message?.content ?? ''
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  text = text.replace(/^["'"']+|["'"']+$/g, '').trim()
  return text
}

// A character speaks on the current agenda topic, having heard the recent lines.
async function speakOnTopic(
  personaId: string,
  topic: AgendaTopic,
  history: ConvEntry[],
  isOpener: boolean,
): Promise<string> {
  const persona = PERSONAS.find((p) => p.id === personaId)!
  const system = PERSONA_SYSTEM_PROMPTS[personaId] ?? ''

  const historyText =
    history.length > 0
      ? `[Các câu vừa nói trong cuộc họp:]\n${history.map((h) => `${h.name}: "${h.text}"`).join('\n')}\n\n`
      : ''

  const user = isOpener
    ? `[Cuộc họp nhóm Bom Tấn. Trưởng nhóm Duy mở một chủ đề mới để phát triển nhóm.]
Chủ đề: "${topic.title}".
Trọng tâm: ${topic.focus}
Gợi ý: ${topic.opener}

Duy mở đầu chủ đề này thế nào? Nêu vấn đề bằng giọng trưởng nhóm và hỏi anh em một câu cụ thể.`
    : `[Cuộc họp nhóm Bom Tấn đang bàn chủ đề: "${topic.title}".]
Trọng tâm: ${topic.focus}

${historyText}Cả phòng đang chờ ${persona.name} góp ý ĐÚNG vào chủ đề này (không lạc đề). ${persona.name} nói gì?`

  let text = await ollamaChat(system, user)
  text = text.replace(new RegExp(`^${persona.name}\\s*[:：-]\\s*`, 'i'), '').trim()
  return text
}

// Secretary distills the topic discussion into one concrete action item for Duy.
async function distillActionItem(topic: AgendaTopic, topicLines: ConvEntry[]): Promise<string> {
  if (topicLines.length === 0) return ''
  const user = `Chủ đề: "${topic.title}".
Trao đổi của nhóm:
${topicLines.map((l) => `- ${l.name}: ${l.text}`).join('\n')}

Việc cần làm cho trưởng nhóm Duy là gì?`
  let text = await ollamaChat(SECRETARY_PROMPT, user, { temperature: 0.5, num_predict: 70 })
  text = text.replace(/^[-•\d.\s]+/, '').replace(/^["'"']+|["'"']+$/g, '').trim()
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
  return { characters, problems: [], actionItems: [], currentTopic: null, time: 0, speed: 1 }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSimulation() {
  const [state, setState] = useState<SimState>(initialState)
  const [generation, setGeneration] = useState(0)
  const stateRef = useRef<SimState>(initialState())
  const lastTickRef = useRef<number>(performance.now())
  const convHistoryRef = useRef<ConvEntry[]>([])
  const runIdRef = useRef(0)

  const applyState = useCallback(
    (mutator: (s: SimState) => void) => {
      const prev = stateRef.current
      const chars: Record<string, CharacterState> = {}
      for (const id of Object.keys(prev.characters)) chars[id] = { ...prev.characters[id] }
      const next: SimState = { ...prev, characters: chars }
      mutator(next)
      stateRef.current = next
      setState({ ...next })
    },
    [],
  )

  const faceTowardSpeaker = useCallback((s: SimState, speakerId: string) => {
    const sp = s.characters[speakerId].position
    for (const id of Object.keys(s.characters)) {
      if (id === speakerId) continue
      const lp = s.characters[id].position
      s.characters[id].facingAngle = Math.atan2(sp.x - lp.x, sp.z - lp.z)
      s.characters[id].behavior = 'listening'
      s.characters[id].isThinking = false
    }
  }, [])

  // ── Agenda-driven, turn-based meeting loop ────────────────────────────────
  useEffect(() => {
    runIdRef.current += 1
    const myRun = runIdRef.current
    const alive = () => runIdRef.current === myRun

    // One person thinks, then speaks; everyone else listens. Returns the line (or '').
    async function takeTurn(speakerId: string, topic: AgendaTopic, isOpener: boolean): Promise<string> {
      const persona = PERSONAS.find((p) => p.id === speakerId)!

      applyState((s) => {
        s.characters[speakerId].isThinking = true
        s.characters[speakerId].behavior = 'sitting'
        s.characters[speakerId].speech = null
        faceTowardSpeaker(s, speakerId)
      })

      let text = ''
      try {
        text = await speakOnTopic(speakerId, topic, convHistoryRef.current, isOpener)
      } catch (err) {
        console.warn(`[${speakerId}] Ollama error:`, err)
        applyState((s) => {
          s.characters[speakerId].isThinking = false
        })
        await sleep(8000)
        return ''
      }
      if (!alive()) return ''
      if (!text) {
        applyState((s) => {
          s.characters[speakerId].isThinking = false
        })
        return ''
      }

      convHistoryRef.current = [
        ...convHistoryRef.current.slice(-(CONVERSATION_HISTORY_LIMIT - 1)),
        { name: persona.name, text },
      ]

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
        topicTitle: topic.title,
      }

      applyState((s) => {
        s.characters[speakerId].isThinking = false
        s.characters[speakerId].behavior = 'talking'
        s.characters[speakerId].speech = `${emoji} ${text}`
        s.characters[speakerId].facingAngle = Math.PI
        s.problems = [...s.problems.slice(-49), problem]
      })

      const readMs = Math.min(READING_TIME.max, Math.max(READING_TIME.min, text.length * READING_TIME.perChar))
      await sleep(readMs)
      if (!alive()) return ''

      applyState((s) => {
        s.characters[speakerId].speech = null
        s.characters[speakerId].behavior = 'sitting'
      })
      await sleep(randomBetween(PAUSE_BETWEEN.min, PAUSE_BETWEEN.max))
      return text
    }

    async function meetingLoop() {
      await sleep(1500)
      let topicIdx = 0

      while (alive()) {
        const topic = AGENDA[topicIdx % AGENDA.length]
        topicIdx++

        applyState((s) => {
          s.currentTopic = { id: topic.id, title: topic.title }
        })

        const topicLines: ConvEntry[] = []

        // 1) Leader opens the topic
        const opener = await takeTurn('duc', topic, true)
        if (!alive()) break
        if (opener) topicLines.push({ name: 'Trần Đăng Duy', text: opener })

        // 2) Relevant members weigh in, in order
        for (const pid of topic.participants) {
          if (!alive()) break
          const persona = PERSONAS.find((p) => p.id === pid)
          const line = await takeTurn(pid, topic, false)
          if (line && persona) topicLines.push({ name: persona.name, text: line })
        }
        if (!alive()) break

        // 3) Secretary distills one concrete action item for Duy
        try {
          const action = await distillActionItem(topic, topicLines)
          if (alive() && action) {
            applyState((s) => {
              s.actionItems = [
                ...s.actionItems,
                { id: `${Date.now()}-${topic.id}`, topicTitle: topic.title, text: action },
              ]
            })
          }
        } catch (err) {
          console.warn('[secretary] error:', err)
        }

        await sleep(randomBetween(2500, 4500))
      }
    }

    meetingLoop()
    return () => {
      runIdRef.current += 1
    }
  }, [applyState, faceTowardSpeaker, generation])

  // ── Animation tick ────────────────────────────────────────────────────────
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
    const fresh = initialState()
    stateRef.current = fresh
    setState(fresh)
    setGeneration((g) => g + 1)
  }, [])

  return { state, setSpeed, reset }
}
