import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Stars } from '@react-three/drei'
import Office3D from '../components/office/Office3D'
import Character3D from '../components/office/Character3D'
import ProblemLog from '../components/office/ProblemLog'
import { useSimulation } from '../hooks/useSimulation'
import { PERSONAS } from '../data/simulation'

export default function VirtualOffice() {
  const { state, setSpeed, reset, sendUtterance, injectScenario, clearScenario, exportMinutes } = useSimulation()
  const { characters, problems, actionItems, coaching, mood, currentTopic, scenario, time, speed } = state

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a14', position: 'relative' }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [-2, 15, 20], fov: 52 }}
        shadows
        style={{ width: 'calc(100% - 300px)', height: '100%' }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.55} />
          <directionalLight
            position={[8, 14, 8]}
            intensity={0.9}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-6, 5, -3]} intensity={0.4} color="#FFF9C4" />
          <pointLight position={[6, 5, 5]} intensity={0.3} color="#E3F2FD" />

          {/* Office environment */}
          <Office3D problems={problems} />

          {/* Characters */}
          {PERSONAS.map((persona) => {
            const cs = characters[persona.id]
            if (!cs) return null
            return <Character3D key={persona.id} charState={cs} />
          })}

          {/* Camera controls */}
          <OrbitControls
            enablePan
            maxPolarAngle={Math.PI / 2.15}
            minDistance={7}
            maxDistance={35}
            target={[-2, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Header overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 300,
          padding: '14px 20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ color: 'white', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: '#FE2C55',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            🏠
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Văn Phòng BĐS Ảo — Nhóm Bom Tấn (Sài Gòn King Land)</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              Giả lập họp phát triển nhóm — AI bàn theo agenda & xuất việc cần làm · Kéo chuột để xoay
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          background: 'rgba(0,0,0,0.7)',
          borderRadius: 10,
          padding: '10px 14px',
          fontFamily: 'system-ui',
          fontSize: 11,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          backdropFilter: 'blur(6px)',
        }}
      >
        <div style={{ fontSize: 9, color: '#777', marginBottom: 2, display: 'flex', gap: 8 }}>
          <span>Nhân sự</span>
          <span style={{ marginLeft: 'auto', color: '#34D399' }}>Tinh thần</span>
          <span style={{ color: '#FBBF24' }}>N.lượng</span>
          <span style={{ color: '#F87171' }}>Áp lực</span>
        </div>
        {PERSONAS.map((p) => {
          const m = mood[p.id] ?? { tinhThan: 60, nangLuong: 60, apLuc: 50 }
          const bar = (val: number, color: string) => (
            <div style={{ width: 26, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${val}%`, height: '100%', background: color }} />
            </div>
          )
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: p.color, fontSize: 10, width: 96, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
                {bar(m.tinhThan, '#34D399')}
                {bar(m.nangLuong, '#FBBF24')}
                {bar(m.apLuc, '#F87171')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Problem log panel */}
      <ProblemLog
        problems={problems}
        actionItems={actionItems}
        coaching={coaching}
        currentTopic={currentTopic}
        scenario={scenario}
        time={time}
        speed={speed}
        onSpeedChange={setSpeed}
        onReset={reset}
        onSend={sendUtterance}
        onScenario={injectScenario}
        onClearScenario={clearScenario}
        onExport={exportMinutes}
      />
    </div>
  )
}
