import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import {
  PERSONAS,
  WAYPOINTS,
  SIMULATION_SCRIPT,
  SCRIPT_DURATION,
  Problem,
  PersonaData,
} from '../data/simulation'

export type CharacterBehavior = 'sitting' | 'walking' | 'talking' | 'frustrated' | 'meeting' | 'coffee'

export interface CharacterState {
  persona: PersonaData
  position: THREE.Vector3
  target: THREE.Vector3
  behavior: CharacterBehavior
  speech: string | null
  speechExpiry: number
  facingAngle: number
}

export interface SimState {
  characters: Record<string, CharacterState>
  problems: Problem[]
  time: number
  speed: number
}

function personaById(id: string) {
  return PERSONAS.find((p) => p.id === id)!
}

const MEETING_SEATS: Record<string, THREE.Vector3> = {
  tuan: new THREE.Vector3(-7, 0, -4.5),
  huong: new THREE.Vector3(-6, 0, -5.5),
  linh: new THREE.Vector3(-5, 0, -4.5),
  duc: new THREE.Vector3(-5.5, 0, -3.5),
  mai: new THREE.Vector3(-4.5, 0, -3.5),
}

function deskTarget(personaId: string) {
  return (WAYPOINTS as Record<string, THREE.Vector3>)[`${personaId}_desk`]
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
      facingAngle: Math.PI, // face toward camera
    }
  }
  return { characters, problems: [], time: 0, speed: 1 }
}

export function useSimulation() {
  const [state, setState] = useState<SimState>(initialState)
  const stateRef = useRef<SimState>(initialState())
  const lastTickRef = useRef<number>(performance.now())
  const firedRef = useRef<Set<string>>(new Set())
  const problemIdCounter = useRef(0)

  const setSpeed = useCallback((speed: number) => {
    stateRef.current.speed = speed
    setState((s) => ({ ...s, speed }))
  }, [])

  const reset = useCallback(() => {
    const fresh = initialState()
    stateRef.current = fresh
    firedRef.current = new Set()
    problemIdCounter.current = 0
    setState(fresh)
  }, [])

  useEffect(() => {
    let rafId: number

    function tick() {
      const now = performance.now()
      const rawDelta = (now - lastTickRef.current) / 1000
      lastTickRef.current = now
      const delta = Math.min(rawDelta, 0.1) * stateRef.current.speed

      const s = stateRef.current
      const newTime = (s.time + delta) % SCRIPT_DURATION

      // Re-fire events when loop restarts
      if (newTime < s.time) {
        firedRef.current = new Set()
      }

      // Check script events
      const newProblems: Problem[] = []
      for (const event of SIMULATION_SCRIPT) {
        const key = `${event.time}_${event.who}_${event.action.type}`
        if (event.time <= newTime && !firedRef.current.has(key)) {
          firedRef.current.add(key)
          const persona = personaById(event.who)
          const char = s.characters[event.who]
          if (!char) continue

          if (event.action.type === 'speech') {
            const { msg, feature, severity, emoji } = event.action
            char.speech = `${emoji} ${msg}`
            char.speechExpiry = newTime + 5.5
            char.behavior = 'talking'
            newProblems.push({
              id: String(++problemIdCounter.current),
              timestamp: newTime,
              who: event.who,
              personaName: persona.name,
              role: persona.role,
              color: persona.color,
              message: msg,
              featureRequest: feature,
              severity,
              emoji,
            })
          } else if (event.action.type === 'walk') {
            let target: THREE.Vector3
            if (event.action.target === 'desk') target = deskTarget(event.who).clone()
            else if (event.action.target === 'meeting') target = MEETING_SEATS[event.who]?.clone() ?? WAYPOINTS.meeting.clone()
            else if (event.action.target === 'coffee') target = WAYPOINTS.coffee.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5))
            else if (event.action.target === 'colleague' && event.action.colleagueId) {
              const colDesk = deskTarget(event.action.colleagueId)
              target = colDesk.clone().add(new THREE.Vector3(1.2, 0, -0.5))
            } else target = deskTarget(event.who).clone()
            char.target = target
            char.behavior = 'walking'
          } else if (event.action.type === 'callMeeting') {
            char.speech = '📣 Team họp nhanh nào!'
            char.speechExpiry = newTime + 4
            char.behavior = 'talking'
          }
        }
      }

      // Move characters toward targets & update behaviors
      const updatedChars = { ...s.characters }
      for (const id of Object.keys(updatedChars)) {
        const ch = { ...updatedChars[id] }
        const dist = ch.position.distanceTo(ch.target)
        if (dist > 0.12) {
          const dir = ch.target.clone().sub(ch.position).normalize()
          const speed = 2.5
          ch.position = ch.position.clone().add(dir.multiplyScalar(delta * speed))
          ch.facingAngle = Math.atan2(dir.x, dir.z)
          ch.behavior = 'walking'
        } else if (ch.behavior === 'walking') {
          // Arrived
          const deskPos = deskTarget(id)
          const atDesk = ch.position.distanceTo(deskPos) < 0.8
          const atMeeting = ch.position.distanceTo(WAYPOINTS.meeting) < 2.5
          const atCoffee = ch.position.distanceTo(WAYPOINTS.coffee) < 2.0
          if (atMeeting) ch.behavior = 'meeting'
          else if (atCoffee) ch.behavior = 'coffee'
          else if (atDesk) ch.behavior = 'sitting'
          else ch.behavior = 'sitting'
        }
        // Clear expired speech
        if (ch.speech && newTime > ch.speechExpiry) {
          ch.speech = null
          if (ch.behavior === 'talking') {
            const deskPos = deskTarget(id)
            ch.behavior = ch.position.distanceTo(deskPos) < 1 ? 'sitting' : ch.behavior
          }
        }
        updatedChars[id] = ch
      }

      const newState: SimState = {
        ...s,
        time: newTime,
        characters: updatedChars,
        problems: newProblems.length > 0 ? [...s.problems, ...newProblems] : s.problems,
      }
      stateRef.current = newState
      setState(newState)

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return { state, setSpeed, reset }
}
