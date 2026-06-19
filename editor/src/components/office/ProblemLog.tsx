import { useEffect, useRef } from 'react'
import { Problem } from '../../data/simulation'

const SEV_COLOR: Record<string, string> = {
  high: '#EF4444',
  medium: '#F97316',
  low: '#22C55E',
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

  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

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
        <div style={{ fontSize: 13, fontWeight: 700, color: '#FE2C55', marginBottom: 6 }}>
          🤖 Nhóm Bom Tấn — AI Live
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, alignItems: 'center' }}>
          <span style={{ background: '#6366F130', color: '#A5B4FC', borderRadius: 4, padding: '2px 7px' }}>
            ⏱ {timeLabel}
          </span>
          <span style={{ background: '#10B98130', color: '#6EE7B7', borderRadius: 4, padding: '2px 7px' }}>
            💬 {problems.length} tin nhắn
          </span>
        </div>

        {/* Speed controls */}
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
      </div>

      {/* Chat log */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {problems.length === 0 && (
          <div style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: 40 }}>
            Các nhân vật đang khởi động...
          </div>
        )}
        {problems.map((p) => (
          <div
            key={p.id}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${SEV_COLOR[p.severity]}30`,
              borderLeft: `3px solid ${p.color}`,
              borderRadius: 8,
              padding: '9px 11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
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
              <span style={{ fontSize: 10, color: '#555', marginLeft: 'auto' }}>
                {p.emoji}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#ddd', lineHeight: 1.5 }}>
              {p.message}
            </div>
          </div>
        ))}
      </div>

      {/* Footer — recent speakers */}
      {problems.length > 0 && (
        <div
          style={{
            padding: '10px 14px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: 10,
            color: '#666',
          }}
        >
          Vừa nói:{' '}
          {[...new Map(
            [...problems].reverse().slice(0, 4).map((p) => [p.who, p]),
          ).values()]
            .map((p) => (
              <span key={p.who} style={{ color: p.color, marginRight: 6 }}>
                {p.personaName.split(' ').pop()}
              </span>
            ))}
        </div>
      )}
    </div>
  )
}
