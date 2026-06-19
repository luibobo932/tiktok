import { useEffect, useRef } from 'react'
import { Problem, ActionItem } from '../../data/simulation'

interface Props {
  problems: Problem[]
  actionItems: ActionItem[]
  currentTopic: { id: string; title: string } | null
  time: number
  speed: number
  onSpeedChange: (s: number) => void
  onReset: () => void
}

export default function ProblemLog({
  problems,
  actionItems,
  currentTopic,
  time,
  speed,
  onSpeedChange,
  onReset,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [problems.length])
  useEffect(() => {
    if (actionRef.current) actionRef.current.scrollTop = actionRef.current.scrollHeight
  }, [actionItems.length])

  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 320,
        height: '100vh',
        background: 'rgba(10,10,20,0.9)',
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
        <div style={{ fontSize: 13, fontWeight: 700, color: '#FE2C55', marginBottom: 8 }}>
          🤖 Họp phát triển nhóm Bom Tấn
        </div>

        {/* Current topic */}
        <div
          style={{
            background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
            borderRadius: 8,
            padding: '8px 11px',
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            📌 Chủ đề đang bàn
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
            {currentTopic ? currentTopic.title : 'Đang bắt đầu cuộc họp...'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, fontSize: 11, alignItems: 'center' }}>
          <span style={{ background: '#6366F130', color: '#A5B4FC', borderRadius: 4, padding: '2px 7px' }}>
            ⏱ {timeLabel}
          </span>
          <span style={{ background: '#10B98130', color: '#6EE7B7', borderRadius: 4, padding: '2px 7px' }}>
            💬 {problems.length}
          </span>
          <span style={{ background: '#F59E0B30', color: '#FCD34D', borderRadius: 4, padding: '2px 7px' }}>
            ✅ {actionItems.length} việc
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
        style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}
      >
        {problems.length === 0 && (
          <div style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: 30 }}>
            Các thành viên đang vào họp...
          </div>
        )}
        {problems.map((p) => (
          <div
            key={p.id}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderLeft: `3px solid ${p.color}`,
              borderRadius: 8,
              padding: '8px 11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.personaName}</span>
              <span style={{ fontSize: 10, color: '#555', marginLeft: 'auto' }}>{p.emoji}</span>
            </div>
            <div style={{ fontSize: 12, color: '#ddd', lineHeight: 1.5 }}>{p.message}</div>
          </div>
        ))}
      </div>

      {/* Action items — the management deliverable */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(245,158,11,0.06)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '34%',
        }}
      >
        <div
          style={{
            padding: '8px 14px 4px',
            fontSize: 11,
            fontWeight: 700,
            color: '#FCD34D',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ✅ Việc cần làm &amp; 🧠 Nhận định
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#A1740B', fontWeight: 400 }}>
            (AI tổng hợp)
          </span>
        </div>
        <div ref={actionRef} style={{ overflowY: 'auto', padding: '4px 12px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {actionItems.length === 0 && (
            <div style={{ color: '#6b5a2a', fontSize: 11, padding: '4px 2px' }}>
              Sẽ xuất hiện sau khi nhóm bàn xong mỗi chủ đề.
            </div>
          )}
          {actionItems.map((a) =>
            a.kind === 'insight' ? (
              <div
                key={a.id}
                style={{
                  background: 'rgba(139,92,246,0.12)',
                  border: '1px solid rgba(139,92,246,0.35)',
                  borderRadius: 7,
                  padding: '7px 10px',
                }}
              >
                <div style={{ fontSize: 9, color: '#C4B5FD', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 }}>
                  🧠 Nhận định chiến lược
                </div>
                <div style={{ fontSize: 12, color: '#E9D5FF', lineHeight: 1.45, fontStyle: 'italic' }}>{a.text}</div>
              </div>
            ) : (
              <div
                key={a.id}
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: 7,
                  padding: '7px 10px',
                }}
              >
                <div style={{ fontSize: 9, color: '#D9A441', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 }}>
                  {a.topicTitle}
                </div>
                <div style={{ fontSize: 12, color: '#FDE9C0', lineHeight: 1.45 }}>→ {a.text}</div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
