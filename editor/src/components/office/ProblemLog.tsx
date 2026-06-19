import { useEffect, useRef } from 'react'
import { Problem } from '../../data/simulation'

const SEV_COLOR: Record<string, string> = {
  high: '#EF4444',
  medium: '#F97316',
  low: '#22C55E',
}
const SEV_LABEL: Record<string, string> = {
  high: 'Gấp',
  medium: 'Cần thiết',
  low: 'Nice-to-have',
}

interface Props {
  problems: Problem[]
  time: number
  speed: number
  onSpeedChange: (s: number) => void
  onReset: () => void
}

export default function ProblemLog({ problems, time, speed, onSpeedChange, onReset }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [problems.length])

  const highCount = problems.filter((p) => p.severity === 'high').length
  const uniqueFeatures = [...new Set(problems.map((p) => p.featureRequest))].length

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 300,
        height: '100vh',
        background: 'rgba(10,10,20,0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#FE2C55', marginBottom: 4 }}>
          📊 Feedback thực tế
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
          <span style={{ background: '#EF444430', color: '#EF4444', borderRadius: 4, padding: '2px 7px' }}>
            🔴 {highCount} vấn đề gấp
          </span>
          <span style={{ background: '#3B82F630', color: '#93C5FD', borderRadius: 4, padding: '2px 7px' }}>
            💡 {uniqueFeatures} tính năng
          </span>
        </div>

        {/* Controls */}
        <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#888' }}>Tốc độ:</span>
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              style={{
                background: speed === s ? '#FE2C55' : 'rgba(255,255,255,0.08)',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                padding: '3px 9px',
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: speed === s ? 700 : 400,
              }}
            >
              {s}x
            </button>
          ))}
          <button
            onClick={onReset}
            style={{
              marginLeft: 'auto',
              background: 'rgba(255,255,255,0.08)',
              color: '#ccc',
              border: 'none',
              borderRadius: 5,
              padding: '3px 9px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            ↺ Reset
          </button>
        </div>

        {/* Time bar */}
        <div style={{ marginTop: 8, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <div
            style={{
              height: '100%',
              width: `${((time % 68) / 68) * 100}%`,
              background: '#FE2C55',
              borderRadius: 2,
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      {/* Problem feed */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {problems.length === 0 && (
          <div style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: 40 }}>
            Đang khởi động mô phỏng...
          </div>
        )}
        {problems.map((p) => (
          <div
            key={p.id}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${SEV_COLOR[p.severity]}40`,
              borderLeft: `3px solid ${SEV_COLOR[p.severity]}`,
              borderRadius: 8,
              padding: '9px 11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: p.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.personaName}</span>
              <span style={{ fontSize: 10, color: '#666', marginLeft: 'auto' }}>
                {Math.floor(p.timestamp)}s
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#ddd', marginBottom: 6, lineHeight: 1.4 }}>
              {p.emoji} {p.message}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  background: '#1E3A5F',
                  color: '#93C5FD',
                  borderRadius: 4,
                  padding: '2px 6px',
                  flex: 1,
                }}
              >
                💡 {p.featureRequest}
              </span>
              <span
                style={{
                  fontSize: 9,
                  background: `${SEV_COLOR[p.severity]}20`,
                  color: SEV_COLOR[p.severity],
                  borderRadius: 4,
                  padding: '2px 5px',
                  flexShrink: 0,
                }}
              >
                {SEV_LABEL[p.severity]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      {problems.length > 0 && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: '#888' }}>
          Top cần làm ngay:
          {[...new Set(
            problems
              .filter((p) => p.severity === 'high')
              .map((p) => p.featureRequest),
          )]
            .slice(0, 3)
            .map((f, i) => (
              <div key={i} style={{ color: '#EF4444', marginTop: 3 }}>
                {i + 1}. {f}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
