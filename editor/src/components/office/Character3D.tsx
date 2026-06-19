import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { CharacterState } from '../../hooks/useSimulation'

interface Props {
  charState: CharacterState
}

const BODY_COLOR_DARKEN = 0.7

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return new THREE.Color(r * BODY_COLOR_DARKEN, g * BODY_COLOR_DARKEN, b * BODY_COLOR_DARKEN)
}

export default function Character3D({ charState }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const walkPhaseRef = useRef(0)
  const shakeRef = useRef(0)

  const { persona, position, behavior, speech, facingAngle } = charState
  const color = persona.color
  const darkColor = hexToRgb(color)

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return

    // Smooth position
    g.position.lerp(
      new THREE.Vector3(position.x, position.y, position.z),
      Math.min(1, delta * 6),
    )

    // Facing rotation
    const targetAngle = facingAngle
    const currentAngle = g.rotation.y
    let diff = targetAngle - currentAngle
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    g.rotation.y += diff * Math.min(1, delta * 5)

    // Animations
    if (behavior === 'walking') {
      walkPhaseRef.current += delta * 8
      const swing = Math.sin(walkPhaseRef.current) * 0.45
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.5
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.5
      // Bob
      g.position.y = Math.abs(Math.sin(walkPhaseRef.current * 0.5)) * 0.06
    } else if (behavior === 'sitting') {
      // Lean forward
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.35
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.35
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.3
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.3
      g.position.y = -0.28
    } else if (behavior === 'talking' || behavior === 'frustrated') {
      // Calm "speaking" gesture: gentle arm motion only — no body shaking
      shakeRef.current += delta * 2.5
      const gesture = (Math.sin(shakeRef.current) * 0.5 + 0.5) * 0.22
      if (leftArmRef.current) leftArmRef.current.rotation.x = -gesture
      if (rightArmRef.current) rightArmRef.current.rotation.x = -gesture * 0.5
      if (bodyRef.current) bodyRef.current.rotation.z = 0
      g.position.y = 0
    } else if (behavior === 'meeting') {
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.2
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.2
      if (bodyRef.current) bodyRef.current.rotation.z = 0
      g.position.y = 0
    } else if (behavior === 'coffee') {
      // Slight sway
      walkPhaseRef.current += delta * 1.5
      g.rotation.y += Math.sin(walkPhaseRef.current) * 0.005
      g.position.y = 0
    } else {
      g.position.y = 0
    }
  })

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* ── Left leg ── */}
      <mesh ref={leftLegRef} position={[-0.13, 0.22, 0.05]}>
        <capsuleGeometry args={[0.09, 0.32, 4, 8]} />
        <meshLambertMaterial color={darkColor} />
      </mesh>
      {/* ── Right leg ── */}
      <mesh ref={rightLegRef} position={[0.13, 0.22, 0.05]}>
        <capsuleGeometry args={[0.09, 0.32, 4, 8]} />
        <meshLambertMaterial color={darkColor} />
      </mesh>
      {/* ── Torso ── */}
      <mesh ref={bodyRef} position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.44, 0.52, 0.26]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* ── Left arm ── */}
      <mesh ref={leftArmRef} position={[-0.28, 0.72, 0]}>
        <capsuleGeometry args={[0.075, 0.28, 4, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* ── Right arm ── */}
      <mesh ref={rightArmRef} position={[0.28, 0.72, 0]}>
        <capsuleGeometry args={[0.075, 0.28, 4, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* ── Neck ── */}
      <mesh position={[0, 1.06, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.14, 8]} />
        <meshLambertMaterial color="#D4A056" />
      </mesh>
      {/* ── Head ── */}
      <mesh position={[0, 1.28, 0]} castShadow>
        <sphereGeometry args={[0.23, 14, 14]} />
        <meshLambertMaterial color="#FDBCB4" />
      </mesh>
      {/* ── Hair ── */}
      <mesh position={[0, 1.42, -0.04]}>
        <sphereGeometry args={[0.2, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshLambertMaterial color={color} />
      </mesh>

      {/* ── Name tag ── */}
      <Text
        position={[0, 1.85, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
        outlineColor="white"
        outlineWidth={0.012}
      >
        {persona.name}
      </Text>
      <Text
        position={[0, 1.65, 0]}
        fontSize={0.1}
        color="#666"
        anchorX="center"
        outlineColor="white"
        outlineWidth={0.01}
      >
        {persona.role}
      </Text>

      {/* ── Speech bubble ── */}
      {speech && (
        <Html position={[0, 2.45, 0]} center distanceFactor={10} zIndexRange={[100, 0]} pointerEvents="none">
          <div
            style={{
              width: 260,
              borderRadius: 16,
              background: '#ffffff',
              border: `3px solid ${color}`,
              boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {/* Name header */}
            <div
              style={{
                background: color,
                color: 'white',
                fontSize: 14,
                fontWeight: 800,
                padding: '5px 12px',
                letterSpacing: 0.2,
              }}
            >
              {persona.name}
            </div>
            {/* Message body */}
            <div
              style={{
                padding: '10px 13px',
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.45,
                color: '#0f0f1a',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {speech}
            </div>
            {/* Bubble tail */}
            <div
              style={{
                position: 'absolute',
                bottom: -13,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '11px solid transparent',
                borderRight: '11px solid transparent',
                borderTop: `14px solid ${color}`,
              }}
            />
          </div>
        </Html>
      )}
    </group>
  )
}
