import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { PERSONAS, WAYPOINTS, Problem, ActionItem, PersonaData } from '../data/simulation'
import { buildSystemPrompt, PERSONA_EMOJIS, PERSONA_SEVERITY } from '../data/personaPrompts'
import { AGENDA, SECRETARY_PROMPT, OBSERVER_PROMPT, COACH_PROMPT, AgendaTopic } from '../data/meetingAgenda'
import { BASELINE_MOOD, Mood } from '../data/teamData'
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
  coaching: { id: string; personaId: string; name: string; color: string; advice: string }[]
  mood: Record<string, Mood>
  currentTopic: { id: string; title: string } | null
  scenario: string | null
  time: number
  speed: number
}

interface ConvEntry {
  name: string
  text: string
}

const STORE_KEY = 'bomtan_sim_v2'
const CALL_NAME: Record<string, string> = {
  duc: 'Duy', huy: 'Huy', tuan: 'Công', huong: 'Dũng', luan: 'Luân',
  tri: 'Trí', mai: 'Thắng', khoa: 'Khoa', thanhduy: 'Thanh Duy',
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
      think: false,
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

async function speakOnTopic(
  personaId: string,
  topic: AgendaTopic,
  history: ConvEntry[],
  isOpener: boolean,
  scenario: string | null,
  priorDecision?: string,
  leaderMsg?: string,
): Promise<string> {
  const persona = PERSONAS.find((p) => p.id === personaId)!
  const system = buildSystemPrompt(personaId)
  const scenarioLine = scenario ? `\n[TÌNH HUỐNG ĐANG XẢY RA, hãy phản ứng với nó: ${scenario}]\n` : ''
  const historyText =
    history.length > 0
      ? `[Các câu vừa nói trong cuộc họp:]\n${history.map((h) => `${h.name}: "${h.text}"`).join('\n')}\n\n`
      : ''

  const followUp = priorDecision
    ? `\n[Lần trước chủ đề này nhóm đã chốt: "${priorDecision}". ĐỪNG mở lại từ đầu — hãy hỏi tiến độ việc đó hoặc đẩy sâu thêm một góc mới.]`
    : ''

  const user = leaderMsg
    ? `[Cuộc họp nhóm Bom Tấn. Trưởng nhóm Duy vừa nói TRỰC TIẾP với cả nhóm:]
"${leaderMsg}"
${scenarioLine}${historyText}Bạn (${persona.name}) đáp lại trưởng nhóm thế nào? Phản ứng thật đúng cá tính, năng lực và hoàn cảnh của bạn — có thể đồng tình, phản biện, xin làm rõ, hoặc cam kết. Đáp THẲNG vào điều Duy vừa nói, không lảng sang chuyện khác.`
    : isOpener
      ? `[Cuộc họp nhóm Bom Tấn. Trưởng nhóm Duy ${priorDecision ? 'quay lại' : 'mở'} một chủ đề để phát triển nhóm.]
Chủ đề: "${topic.title}".
Trọng tâm: ${topic.focus}
Gợi ý: ${topic.opener}${followUp}${scenarioLine}
${historyText}Duy mở đầu chủ đề này thế nào? Nêu vấn đề bằng giọng trưởng nhóm và hỏi anh em một câu cụ thể, không lặp lại điều đã nói.`
      : `[Cuộc họp nhóm Bom Tấn đang bàn chủ đề: "${topic.title}".]
Trọng tâm: ${topic.focus}${scenarioLine}
${historyText}Cả phòng đang chờ ${persona.name} góp ý ĐÚNG vào chủ đề này (không lạc đề). ${persona.name} nói gì?`

  let text = await ollamaChat(system, user)
  // Strip a self-attribution prefix the model sometimes adds: "Tên nói:", "Khoa:", etc.
  const lastWord = persona.name.split(' ').pop() ?? ''
  const names = [persona.name, lastWord].filter(Boolean).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  text = text
    .replace(new RegExp(`^["'"']?\\s*(?:${names.join('|')})\\s*(?:nói[^:：]*)?[:：]\\s*["'"']?`, 'i'), '')
    .replace(/^["'"']+|["'"']+$/g, '')
    .trim()
  return text
}

// Adaptive topic pick: avoid immediate repeat, favor unseen topics, and let the
// team's mood steer (high stress → discipline; low morale → target/morale).
function pickTopic(prevId: string | null, mood: Record<string, Mood>, covered: Set<string>): AgendaTopic {
  const ids = Object.keys(mood)
  const avg = (sel: (m: Mood) => number) => ids.reduce((a, id) => a + sel(mood[id]), 0) / Math.max(1, ids.length)
  const avgStress = avg((m) => m.apLuc)
  const avgMorale = avg((m) => m.tinhThan)

  const weights = AGENDA.map((t) => {
    if (t.id === prevId) return 0
    let w = 2
    if (!covered.has(t.id)) w += 3 // see fresh topics first
    if (avgStress > 65 && (t.id === 'discipline' || t.id === 'listings')) w += 3
    if (avgMorale < 55 && (t.id === 'target' || t.id === 'discipline')) w += 2
    return w
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < AGENDA.length; i++) {
    r -= weights[i]
    if (r <= 0) return AGENDA[i]
  }
  return AGENDA[0]
}

async function distillActionItem(topic: AgendaTopic, topicLines: ConvEntry[]): Promise<string> {
  if (topicLines.length === 0) return ''
  const user = `Chủ đề: "${topic.title}".\nTrao đổi của nhóm:\n${topicLines
    .map((l) => `- ${l.name}: ${l.text}`)
    .join('\n')}\n\nViệc cần làm cho trưởng nhóm Duy là gì?`
  let text = await ollamaChat(SECRETARY_PROMPT, user, { temperature: 0.5, num_predict: 70 })
  return text.replace(/^[-•\d.\s]+/, '').replace(/^["'"']+|["'"']+$/g, '').trim()
}

async function distillInsight(recentActions: string[]): Promise<string> {
  if (recentActions.length === 0) return ''
  const user = `Các việc cần làm vừa rút ra từ cuộc họp:\n${recentActions
    .map((a, i) => `${i + 1}. ${a}`)
    .join('\n')}\n\nNhận định chiến lược tầm cao cho trưởng nhóm Duy là gì?`
  let text = await ollamaChat(OBSERVER_PROMPT, user, { temperature: 0.6, num_predict: 90 })
  return text.replace(/^[-•\d.\s]+/, '').replace(/^["'"']+|["'"']+$/g, '').trim()
}

// Batched coaching: 1 call → 1 advice line per participant who spoke.
async function coachParticipants(
  topic: AgendaTopic,
  memberLines: { id: string; name: string; text: string }[],
): Promise<Record<string, string>> {
  if (memberLines.length === 0) return {}
  const user = `Chủ đề: "${topic.title}".\nCác nhân viên vừa phát biểu:\n${memberLines
    .map((l) => `${CALL_NAME[l.id] ?? l.name}: "${l.text}"`)
    .join('\n')}\n\nVới mỗi người, cho Duy 1 nước đi quản trị (đúng định dạng "Tên: lời khuyên").`
  const text = await ollamaChat(COACH_PROMPT, user, { temperature: 0.6, num_predict: 200 })
  const out: Record<string, string> = {}
  for (const raw of text.split('\n')) {
    const line = raw.replace(/^[-•\d.\s]+/, '').trim()
    const m = line.match(/^([^:：]+)[:：]\s*(.+)$/)
    if (!m) continue
    const who = m[1].trim().toLowerCase()
    const advice = m[2].replace(/^(nước đi|nuoc di)\s*[:：-]\s*/i, '').trim()
    for (const l of memberLines) {
      const call = (CALL_NAME[l.id] ?? '').toLowerCase()
      if (who === call || who.includes(call) || l.name.toLowerCase().includes(who)) {
        out[l.id] = advice
        break
      }
    }
  }
  return out
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deskTarget(personaId: string): THREE.Vector3 {
  return (WAYPOINTS as Record<string, THREE.Vector3>)[`${personaId}_desk`]
}
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const clamp = (n: number) => Math.max(0, Math.min(100, n))

function freshMood(): Record<string, Mood> {
  const m: Record<string, Mood> = {}
  for (const p of PERSONAS) m[p.id] = { ...(BASELINE_MOOD[p.id] ?? { tinhThan: 60, nangLuong: 60, apLuc: 50 }) }
  return m
}

function loadPersisted(): Partial<SimState> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return {}
    const d = JSON.parse(raw)
    return { actionItems: d.actionItems ?? [], coaching: d.coaching ?? [], mood: d.mood ?? freshMood() }
  } catch {
    return {}
  }
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
  const persisted = loadPersisted()
  return {
    characters,
    problems: [],
    actionItems: persisted.actionItems ?? [],
    coaching: persisted.coaching ?? [],
    mood: persisted.mood ?? freshMood(),
    currentTopic: null,
    scenario: null,
    time: 0,
    speed: 1,
  }
}

// Mood drift when someone speaks on a topic.
function nudgeMood(mood: Record<string, Mood>, speakerId: string, topicId: string): Record<string, Mood> {
  const next: Record<string, Mood> = {}
  for (const id of Object.keys(mood)) {
    const base = BASELINE_MOOD[id] ?? { tinhThan: 60, nangLuong: 60, apLuc: 50 }
    const m = mood[id]
    // gentle decay toward baseline
    next[id] = {
      tinhThan: clamp(m.tinhThan + (base.tinhThan - m.tinhThan) * 0.05),
      nangLuong: clamp(m.nangLuong + (base.nangLuong - m.nangLuong) * 0.05),
      apLuc: clamp(m.apLuc + (base.apLuc - m.apLuc) * 0.05),
    }
  }
  const s = next[speakerId]
  if (s) {
    s.nangLuong = clamp(s.nangLuong + 4) // engaged by speaking
    if (topicId === 'discipline' || topicId === 'listings') {
      s.apLuc = clamp(s.apLuc + (['mai', 'tri', 'huy'].includes(speakerId) ? 6 : 2))
    }
    if (topicId === 'content' || topicId === 'target') {
      s.tinhThan = clamp(s.tinhThan + (['thanhduy', 'khoa', 'huong'].includes(speakerId) ? 5 : 2))
    }
    if (topicId === 'pipeline' && ['duc', 'huy', 'tri', 'mai', 'khoa'].includes(speakerId)) {
      s.apLuc = clamp(s.apLuc + 4) // pressure for those without sales
    }
  }
  return next
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSimulation() {
  const [state, setState] = useState<SimState>(initialState)
  const [generation, setGeneration] = useState(0)
  const stateRef = useRef<SimState>(initialState())
  const lastTickRef = useRef<number>(performance.now())
  const convHistoryRef = useRef<ConvEntry[]>([])
  const scenarioRef = useRef<string | null>(null)
  const pendingUserRef = useRef<string[]>([]) // leader (user) messages awaiting team reaction
  const runIdRef = useRef(0)

  const applyState = useCallback((mutator: (s: SimState) => void) => {
    const prev = stateRef.current
    const chars: Record<string, CharacterState> = {}
    for (const id of Object.keys(prev.characters)) chars[id] = { ...prev.characters[id] }
    const next: SimState = { ...prev, characters: chars }
    mutator(next)
    stateRef.current = next
    setState({ ...next })
  }, [])

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

  // ── Persist deliverables ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ actionItems: state.actionItems, coaching: state.coaching, mood: state.mood }),
      )
    } catch {
      /* ignore quota */
    }
  }, [state.actionItems, state.coaching, state.mood])

  // ── Agenda-driven meeting loop ────────────────────────────────────────────
  useEffect(() => {
    runIdRef.current += 1
    const myRun = runIdRef.current
    const alive = () => runIdRef.current === myRun

    // Sleep that returns early if the leader (user) sends a message, so the team reacts fast.
    async function sleepOrUser(ms: number) {
      let waited = 0
      while (waited < ms && alive() && pendingUserRef.current.length === 0) {
        const step = Math.min(250, ms - waited)
        await sleep(step)
        waited += step
      }
    }

    // When the user (as Duy) speaks, have 1-2 members react directly to it.
    async function drainUserMsgs(topic: AgendaTopic) {
      while (alive() && pendingUserRef.current.length > 0) {
        const msg = pendingUserRef.current.shift()!
        const members = PERSONAS.filter((p) => p.id !== 'duc').map((p) => p.id)
        // shuffle, take 1-2 responders
        for (let i = members.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[members[i], members[j]] = [members[j], members[i]]
        }
        const responders = members.slice(0, Math.random() < 0.5 ? 1 : 2)
        for (const rid of responders) {
          if (!alive()) return
          await takeTurn(rid, topic, false, undefined, msg)
        }
      }
    }

    async function takeTurn(
      speakerId: string,
      topic: AgendaTopic,
      isOpener: boolean,
      priorDecision?: string,
      leaderMsg?: string,
    ): Promise<string> {
      const persona = PERSONAS.find((p) => p.id === speakerId)!
      applyState((s) => {
        s.characters[speakerId].isThinking = true
        s.characters[speakerId].behavior = 'sitting'
        s.characters[speakerId].speech = null
        faceTowardSpeaker(s, speakerId)
      })

      let text = ''
      try {
        text = await speakOnTopic(speakerId, topic, convHistoryRef.current, isOpener, scenarioRef.current, priorDecision, leaderMsg)
      } catch (err) {
        console.warn(`[${speakerId}] error:`, err)
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
        s.mood = nudgeMood(s.mood, speakerId, topic.id)
      })

      const readMs = Math.min(READING_TIME.max, Math.max(READING_TIME.min, text.length * READING_TIME.perChar))
      await sleep(readMs)
      if (!alive()) return ''
      applyState((s) => {
        s.characters[speakerId].speech = null
        s.characters[speakerId].behavior = 'sitting'
      })
      await sleepOrUser(randomBetween(PAUSE_BETWEEN.min, PAUSE_BETWEEN.max))
      return text
    }

    async function meetingLoop() {
      await sleep(1500)
      let cycleCount = 0
      let prevId: string | null = null
      const covered = new Set<string>()
      while (alive()) {
        const topic = pickTopic(prevId, stateRef.current.mood, covered)
        prevId = topic.id
        covered.add(topic.id)
        cycleCount++
        applyState((s) => {
          s.currentTopic = { id: topic.id, title: topic.title }
        })

        const topicLines: ConvEntry[] = []
        const memberLines: { id: string; name: string; text: string }[] = []

        // If this topic was decided before, leader follows up instead of re-asking.
        const prior = [...stateRef.current.actionItems]
          .reverse()
          .find((a) => a.kind !== 'insight' && a.topicTitle === topic.title)
        await drainUserMsgs(topic) // react to any leader (user) message first
        if (!alive()) break

        const opener = await takeTurn('duc', topic, true, prior?.text)
        if (!alive()) break
        if (opener) topicLines.push({ name: 'Trần Đăng Duy', text: opener })
        await drainUserMsgs(topic)

        for (const pid of topic.participants) {
          if (!alive()) break
          await drainUserMsgs(topic)
          if (!alive()) break
          const persona = PERSONAS.find((p) => p.id === pid)
          const line = await takeTurn(pid, topic, false)
          if (line && persona) {
            topicLines.push({ name: persona.name, text: line })
            memberLines.push({ id: pid, name: persona.name, text: line })
          }
        }
        if (!alive()) break

        // Action item
        try {
          const action = await distillActionItem(topic, topicLines)
          if (alive() && action) {
            applyState((s) => {
              s.actionItems = [
                ...s.actionItems,
                { id: `${Date.now()}-${topic.id}`, topicTitle: topic.title, text: action, kind: 'action' },
              ]
            })
          }
        } catch (err) {
          console.warn('[secretary]', err)
        }
        if (!alive()) break

        // Coaching cards (batched)
        try {
          const advices = await coachParticipants(topic, memberLines)
          if (alive() && Object.keys(advices).length) {
            applyState((s) => {
              const map = new Map(s.coaching.map((c) => [c.personaId, c]))
              for (const [pid, advice] of Object.entries(advices)) {
                const persona = PERSONAS.find((p) => p.id === pid)!
                map.set(pid, { id: `${pid}`, personaId: pid, name: persona.name, color: persona.color, advice })
              }
              s.coaching = [...map.values()]
            })
          }
        } catch (err) {
          console.warn('[coach]', err)
        }
        if (!alive()) break

        // Reflection every 3 topics
        if (cycleCount % 3 === 0) {
          try {
            const recent = stateRef.current.actionItems
              .filter((a) => a.kind !== 'insight')
              .slice(-3)
              .map((a) => a.text)
            const insight = await distillInsight(recent)
            if (alive() && insight) {
              applyState((s) => {
                s.actionItems = [
                  ...s.actionItems,
                  { id: `${Date.now()}-insight`, topicTitle: 'Nhận định', text: insight, kind: 'insight' },
                ]
              })
            }
          } catch (err) {
            console.warn('[observer]', err)
          }
        }

        await drainUserMsgs(topic)
        await sleepOrUser(randomBetween(2500, 4500))
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
    scenarioRef.current = null
    pendingUserRef.current = []
    if (typeof window !== 'undefined') localStorage.removeItem(STORE_KEY)
    const characters: Record<string, CharacterState> = {}
    for (const p of PERSONAS) {
      const desk = deskTarget(p.id)
      characters[p.id] = {
        persona: p, position: desk.clone(), target: desk.clone(), behavior: 'sitting',
        speech: null, speechExpiry: 0, facingAngle: Math.PI, isThinking: false,
      }
    }
    const fresh: SimState = {
      characters, problems: [], actionItems: [], coaching: [], mood: freshMood(),
      currentTopic: null, scenario: null, time: 0, speed: stateRef.current.speed,
    }
    stateRef.current = fresh
    setState(fresh)
    setGeneration((g) => g + 1)
  }, [])

  // ── Human-in-the-loop: leader (the real user) speaks to the team ──
  const sendUtterance = useCallback((raw: string) => {
    const text = raw.trim()
    if (!text) return
    convHistoryRef.current = [
      ...convHistoryRef.current.slice(-(CONVERSATION_HISTORY_LIMIT - 1)),
      { name: 'Trưởng nhóm Duy (bạn)', text },
    ]
    pendingUserRef.current.push(text) // queue for the team to react to
    applyState((s) => {
      s.problems = [
        ...s.problems.slice(-49),
        {
          id: `${Date.now()}-you`,
          timestamp: s.time,
          who: '_user',
          personaName: 'Bạn (Trưởng nhóm)',
          role: '',
          color: '#FFFFFF',
          message: text,
          severity: 'high',
          emoji: '🎙️',
        },
      ]
    })
  }, [applyState])

  // ── Scenario injection: drop a real-world situation into the meeting ──
  const injectScenario = useCallback((raw: string) => {
    const text = raw.trim()
    if (!text) return
    scenarioRef.current = text
    applyState((s) => {
      s.scenario = text
      s.problems = [
        ...s.problems.slice(-49),
        {
          id: `${Date.now()}-scn`,
          timestamp: s.time,
          who: '_scenario',
          personaName: 'Tình huống',
          role: '',
          color: '#F59E0B',
          message: text,
          severity: 'high',
          emoji: '⚡',
        },
      ]
    })
  }, [applyState])

  const clearScenario = useCallback(() => {
    scenarioRef.current = null
    applyState((s) => {
      s.scenario = null
    })
  }, [applyState])

  // ── Export meeting minutes as Markdown ──
  const exportMinutes = useCallback(() => {
    if (typeof window === 'undefined') return
    const s = stateRef.current
    const date = new Date().toLocaleString('vi-VN')
    const lines: string[] = []
    lines.push(`# Biên bản họp nhóm Bom Tấn`)
    lines.push(`_Sài Gòn King Land · ${date}_\n`)
    lines.push(`## 🎙️ Hội thoại`)
    for (const p of s.problems) lines.push(`- **${p.personaName}:** ${p.message}`)
    lines.push(`\n## ✅ Việc cần làm cho Trưởng nhóm`)
    s.actionItems.filter((a) => a.kind !== 'insight').forEach((a, i) => lines.push(`${i + 1}. (${a.topicTitle}) ${a.text}`))
    lines.push(`\n## 🧠 Nhận định chiến lược`)
    s.actionItems.filter((a) => a.kind === 'insight').forEach((a) => lines.push(`- ${a.text}`))
    lines.push(`\n## 🎯 Gợi ý quản trị từng người`)
    for (const c of s.coaching) lines.push(`- **${c.name}:** ${c.advice}`)
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bien-ban-bom-tan-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  return { state, setSpeed, reset, sendUtterance, injectScenario, clearScenario, exportMinutes }
}
