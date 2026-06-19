import { useRef } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

// ── Desk ────────────────────────────────────────────────────────────────────
function Desk({ position, color }: { position: THREE.Vector3Tuple; color: string }) {
  return (
    <group position={position}>
      {/* Tabletop */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 0.06, 0.7]} />
        <meshLambertMaterial color="#8B6F47" />
      </mesh>
      {/* Legs */}
      {([-0.6, 0.6] as const).flatMap((x) =>
        ([-0.28, 0.28] as const).map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.38, z]} receiveShadow>
            <boxGeometry args={[0.06, 0.72, 0.06]} />
            <meshLambertMaterial color="#6B4F2A" />
          </mesh>
        )),
      )}
      {/* Monitor stand */}
      <mesh position={[0, 0.28, -0.22]}>
        <boxGeometry args={[0.04, 0.5, 0.04]} />
        <meshLambertMaterial color="#333" />
      </mesh>
      {/* Monitor screen */}
      <mesh position={[0, 0.52, -0.27]}>
        <boxGeometry args={[0.72, 0.44, 0.04]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* Screen glow */}
      <mesh position={[0, 0.52, -0.25]}>
        <boxGeometry args={[0.66, 0.38, 0.01]} />
        <meshLambertMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      {/* Chair */}
      <mesh position={[0, -0.18, 0.55]} receiveShadow>
        <boxGeometry args={[0.6, 0.08, 0.55]} />
        <meshLambertMaterial color="#444" />
      </mesh>
      <mesh position={[0, 0.2, 0.78]}>
        <boxGeometry args={[0.58, 0.7, 0.07]} />
        <meshLambertMaterial color="#444" />
      </mesh>
    </group>
  )
}

// ── Meeting Table ────────────────────────────────────────────────────────────
function MeetingTable() {
  return (
    <group position={[-5.5, 0, -4.5]}>
      {/* Table surface */}
      <mesh receiveShadow position={[0, 0.72, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 32]} />
        <meshLambertMaterial color="#5D4037" />
      </mesh>
      {/* Center leg */}
      <mesh receiveShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.72, 12]} />
        <meshLambertMaterial color="#4E342E" />
      </mesh>
      {/* Whiteboard on wall */}
      <mesh position={[2.8, 1.4, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[2.4, 1.3, 0.05]} />
        <meshLambertMaterial color="#F5F5F0" />
      </mesh>
      <Text
        position={[2.75, 1.55, 0.5]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.15}
        color="#222"
        anchorX="center"
        textAlign="center"
        maxWidth={2.2}
        lineHeight={1.4}
      >
        {'QUY DINH NHOM BOM TAN:\n1. DS = phi moi gioi thuc thu\n2. Bao nha hop le huong 1%\n3. Bao gia tot len nhom truoc 3h\n4. Di tre toi da 4 lan/thang'}
      </Text>
      {/* Meeting chairs — 10 people */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const angle = (i / 10) * Math.PI * 2
        const r = 2.4
        return (
          <mesh key={i} position={[Math.sin(angle) * r, 0.38, Math.cos(angle) * r]} receiveShadow>
            <boxGeometry args={[0.48, 0.08, 0.45]} />
            <meshLambertMaterial color="#555" />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Coffee Station ──────────────────────────────────────────────────────────
function CoffeeStation() {
  return (
    <group position={[6.5, 0, 4.5]}>
      {/* Counter */}
      <mesh receiveShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.6]} />
        <meshLambertMaterial color="#5D4037" />
      </mesh>
      {/* Countertop */}
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[1.3, 0.06, 0.7]} />
        <meshLambertMaterial color="#8D6E63" />
      </mesh>
      {/* Coffee machine */}
      <mesh position={[0, 1.28, 0]}>
        <boxGeometry args={[0.35, 0.6, 0.3]} />
        <meshLambertMaterial color="#212121" />
      </mesh>
      <mesh position={[0, 1.12, 0.16]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
        <meshLambertMaterial color="#FFF8E1" />
      </mesh>
      {/* Sign */}
      <Text position={[0, 1.9, 0]} fontSize={0.18} color="#6D4C41" anchorX="center">
        ☕ Coffee
      </Text>
    </group>
  )
}

// ── Problem Board on wall ───────────────────────────────────────────────────
export function ProblemBoard({ problems }: { problems: { id: string; emoji: string; featureRequest: string; severity: string }[] }) {
  const recent = problems.slice(-6)
  return (
    <group position={[9.9, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Board backing */}
      <mesh>
        <boxGeometry args={[4.5, 3.2, 0.06]} />
        <meshLambertMaterial color="#ECEFF1" />
      </mesh>
      <Text position={[0, 1.3, 0.05]} fontSize={0.22} color="#C62828" anchorX="center" fontWeight="bold">
        📌 Feedback Board
      </Text>
      {recent.map((p, i) => (
        <Text
          key={p.id}
          position={[0, 0.9 - i * 0.42, 0.05]}
          fontSize={0.16}
          color={p.severity === 'high' ? '#C62828' : p.severity === 'medium' ? '#E65100' : '#2E7D32'}
          anchorX="center"
          maxWidth={4}
        >
          {`${p.emoji} ${p.featureRequest}`}
        </Text>
      ))}
    </group>
  )
}

// ── Main Office Scene ────────────────────────────────────────────────────────
export default function Office3D({ problems }: { problems: { id: string; emoji: string; featureRequest: string; severity: string }[] }) {
  return (
    <group>
      {/* ── Floor ── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[22, 18]} />
        <meshLambertMaterial color="#EEEEEA" />
      </mesh>

      {/* Meeting room carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0, -4.5]}>
        <planeGeometry args={[6, 5]} />
        <meshLambertMaterial color="#CFD8DC" />
      </mesh>

      {/* Coffee zone rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.5, 0.005, 4]}>
        <planeGeometry args={[3.5, 3]} />
        <meshLambertMaterial color="#D7CCC8" />
      </mesh>

      {/* ── Walls ── */}
      {/* Back wall */}
      <mesh receiveShadow position={[0, 3, -9]}>
        <boxGeometry args={[22, 6, 0.2]} />
        <meshLambertMaterial color="#F5F5F0" />
      </mesh>
      {/* Left wall */}
      <mesh receiveShadow position={[-11, 3, 0]}>
        <boxGeometry args={[0.2, 6, 18]} />
        <meshLambertMaterial color="#FAFAFA" />
      </mesh>
      {/* Right wall */}
      <mesh receiveShadow position={[11, 3, 0]}>
        <boxGeometry args={[0.2, 6, 18]} />
        <meshLambertMaterial color="#FAFAFA" />
      </mesh>

      {/* ── Windows on back wall ── */}
      {[-5, 0, 5].map((x) => (
        <mesh key={x} position={[x, 3.5, -8.85]}>
          <boxGeometry args={[2.4, 1.8, 0.05]} />
          <meshLambertMaterial color="#B3E5FC" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* ── Company logo wall ── */}
      <Text position={[0, 4.5, -8.85]} fontSize={0.4} color="#D84E1E" anchorX="center" fontWeight="bold">
SAI GON KING LAND · NHOM BOM TAN — Moi gioi BDS nha pho
      </Text>

      {/* ── Furniture ── */}
      {/* Row 1 desks (z=3) — 5 desks */}
      <Desk position={[-9.5, 0.72, 3]} color="#8B5CF6" />
      <Desk position={[-6.5, 0.72, 3]} color="#3B82F6" />
      <Desk position={[-2.5, 0.72, 3]} color="#10B981" />
      <Desk position={[1.5, 0.72, 3]} color="#F59E0B" />
      <Desk position={[5, 0.72, 3]} color="#EF4444" />
      {/* Row 2 desks (z=0) — 5 desks */}
      <Desk position={[-7.5, 0.72, 0]} color="#06B6D4" />
      <Desk position={[-4.5, 0.72, 0]} color="#6366F1" />
      <Desk position={[0, 0.72, 0]} color="#EC4899" />
      <Desk position={[3.5, 0.72, 0]} color="#F97316" />
      <Desk position={[7.5, 0.72, 0]} color="#84CC16" />

      {/* Meeting room */}
      <MeetingTable />

      {/* Coffee station */}
      <CoffeeStation />

      {/* Problem board */}
      <ProblemBoard problems={problems} />

      {/* ── Divider partition between rows (covers all 10 desks) ── */}
      <mesh position={[-1, 0.8, 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[20, 1.4, 0.08]} />
        <meshLambertMaterial color="#B0BEC5" transparent opacity={0.5} />
      </mesh>

      {/* ── Plants ── */}
      {[
        [-10, 0, -8],
        [10, 0, -8],
        [10, 0, 8],
        [-10, 0, 8],
      ].map(([x, , z], i) => (
        <group key={i} position={[x as number, 0, z as number]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.22, 0.28, 0.55, 10]} />
            <meshLambertMaterial color="#795548" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.42, 10, 10]} />
            <meshLambertMaterial color="#2E7D32" />
          </mesh>
        </group>
      ))}
    </group>
  )
}
