import { useEffect, useRef, useState } from 'react'
import { Problem, ActionItem } from '../../data/simulation'

interface Coaching {
  id: string
  personaId: string
  name: string
  color: string
  advice: string
}

interface Props {
  problems: Problem[]
  actionItems: ActionItem[]
  coaching: Coaching[]
  currentTopic: { id: string; title: string } | null
  scenario: string | null
  time: number
  speed: number
  onSpeedChange: (s: number) => void
  onReset: () => void
  onSend: (text: string) => void
  onScenario: (text: string) => void
  onClearScenario: () => void
  onExport: () => void
}

export default function ProblemLog({
  problems,
  actionItems,
  coaching,
  currentTopic,
  scenario,
  time,
  speed,
  onSpeedChange,
  onReset,
  onSend,
  onScenario,
  onClearScenario,
  onExport,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<'outcomes' | 'coaching'>('outcomes')
  const [mode, setMode] = useState<'say' | 'scenario'>('say')
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [problems.length])

  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const submit = () => {
    const t = draft.trim()
    if (!t) return
    if (mode === 'say') onSend(t)
    else onScenario(t)
    setDraft('')
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 330,
        height: '100vh',
        background: 'rgba(10,10,20,0.92)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '12px 14px 9px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 7 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#FE2C55' }}>🤖 Họp phát triển nhóm Bom Tấn</div>
          <button
            onClick={onExport}
            title="Tải biên bản (.md)"
            style={{
              marginLeft: 'auto',
              background: 'rgba(255,255,255,0.1)',
              color: '#ddd',
              border: 'none',
              borderRadius: 5,
              padding: '3px 8px',
              fontSize: 10,
              cursor: 'pointer',
            }}
          >
            ⬇ Biên bản
          </button>
        </div>

        {/* Topic banner */}
        <div style={{ background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', borderRadius: 8, padding: '7px 11px' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            📌 Chủ đề đang bàn
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
            {currentTopic ? currentTopic.title : 'Đang bắt đầu...'}
          </div>
        </div>

        {/* Scenario active banner */}
        {scenario && (
          <div
            style={{
              marginTop: 6,
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.4)',
              borderRadius: 7,
              padding: '5px 9px',
              fontSize: 11,
              color: '#FCD34D',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>⚡ {scenario}</span>
            <button
              onClick={onClearScenario}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#FCD34D', cursor: 'pointer', fontSize: 13 }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ marginTop: 8, display: 'flex', gap: 6, fontSize: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: '#6366F130', color: '#A5B4FC', borderRadius: 4, padding: '2px 6px' }}>⏱ {timeLabel}</span>
          <span style={{ background: '#10B98130', color: '#6EE7B7', borderRadius: 4, padding: '2px 6px' }}>💬 {problems.length}</span>
          <span style={{ background: '#F59E0B30', color: '#FCD34D', borderRadius: 4, padding: '2px 6px' }}>
            ✅ {actionItems.filter((a) => a.kind !== 'insight').length}
          </span>
          <span style={{ background: '#8B5CF630', color: '#C4B5FD', borderRadius: 4, padding: '2px 6px' }}>
            🧠 {actionItems.filter((a) => a.kind === 'insight').length}
          </span>
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              style={{
                background: speed === s ? '#FE2C55' : 'rgba(255,255,255,0.08)',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                padding: '2px 7px',
                fontSize: 10,
                cursor: 'pointer',
                fontWeight: speed === s ? 700 : 400,
              }}
            >
              {s}x
            </button>
          ))}
          <button
            onClick={onReset}
            style={{ background: 'rgba(255,255,255,0.08)', color: '#ccc', border: 'none', borderRadius: 5, padding: '2px 7px', fontSize: 10, cursor: 'pointer' }}
          >
            ↺
          </button>
        </div>
      </div>

      {/* Chat log */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 7, minHeight: 0 }}>
        {problems.length === 0 && (
          <div style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: 26 }}>Các thành viên đang vào họp...</div>
        )}
        {problems.map((p) =>
          p.who === '_user' ? (
            <div key={p.id} style={{ alignSelf: 'flex-end', maxWidth: '90%', background: '#FE2C55', borderRadius: '10px 10px 2px 10px', padding: '7px 11px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>🎙️ Bạn (Trưởng nhóm)</div>
              <div style={{ fontSize: 12, color: 'white', lineHeight: 1.45 }}>{p.message}</div>
            </div>
          ) : p.who === '_scenario' ? (
            <div key={p.id} style={{ background: 'rgba(245,158,11,0.12)', border: '1px dashed rgba(245,158,11,0.5)', borderRadius: 8, padding: '7px 11px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#FCD34D' }}>⚡ Tình huống phát sinh</div>
              <div style={{ fontSize: 12, color: '#FDE9C0', lineHeight: 1.45, marginTop: 2 }}>{p.message}</div>
            </div>
          ) : (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', borderLeft: `3px solid ${p.color}`, borderRadius: 8, padding: '8px 11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.personaName}</span>
                <span style={{ fontSize: 10, color: '#555', marginLeft: 'auto' }}>{p.emoji}</span>
              </div>
              <div style={{ fontSize: 12, color: '#ddd', lineHeight: 1.5 }}>{p.message}</div>
            </div>
          ),
        )}
      </div>

      {/* Deliverables: tabs */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', maxHeight: '32%', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', fontSize: 11 }}>
          {(['outcomes', 'coaching'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                background: tab === t ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: tab === t ? 'white' : '#888',
                border: 'none',
                borderBottom: tab === t ? '2px solid #FE2C55' : '2px solid transparent',
                padding: '7px 0',
                cursor: 'pointer',
                fontWeight: tab === t ? 700 : 400,
              }}
            >
              {t === 'outcomes' ? '✅ Việc & Nhận định' : '🎯 Coaching'}
            </button>
          ))}
        </div>
        <div style={{ overflowY: 'auto', padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tab === 'outcomes' &&
            (actionItems.length === 0 ? (
              <div style={{ color: '#6b5a2a', fontSize: 11, padding: '4px 2px' }}>Xuất hiện sau khi nhóm bàn xong mỗi chủ đề.</div>
            ) : (
              actionItems.map((a) =>
                a.kind === 'insight' ? (
                  <div key={a.id} style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: 7, padding: '7px 10px' }}>
                    <div style={{ fontSize: 9, color: '#C4B5FD', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 }}>🧠 Nhận định chiến lược</div>
                    <div style={{ fontSize: 12, color: '#E9D5FF', lineHeight: 1.45, fontStyle: 'italic' }}>{a.text}</div>
                  </div>
                ) : (
                  <div key={a.id} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 7, padding: '7px 10px' }}>
                    <div style={{ fontSize: 9, color: '#D9A441', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 }}>{a.topicTitle}</div>
                    <div style={{ fontSize: 12, color: '#FDE9C0', lineHeight: 1.45 }}>→ {a.text}</div>
                  </div>
                ),
              )
            ))}
          {tab === 'coaching' &&
            (coaching.length === 0 ? (
              <div style={{ color: '#555', fontSize: 11, padding: '4px 2px' }}>Gợi ý quản trị từng người xuất hiện sau khi họ phát biểu.</div>
            ) : (
              coaching.map((c) => (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${c.color}`, borderRadius: 7, padding: '7px 10px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: c.color, marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#ddd', lineHeight: 1.45 }}>🎯 {c.advice}</div>
                </div>
              ))
            ))}
        </div>
      </div>

      {/* Composer: human-in-the-loop / scenario */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {(['say', 'scenario'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                background: mode === m ? (m === 'say' ? '#FE2C55' : '#F59E0B') : 'rgba(255,255,255,0.08)',
                color: mode === m ? (m === 'say' ? 'white' : '#1a1a1a') : '#aaa',
                border: 'none',
                borderRadius: 5,
                padding: '4px 0',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {m === 'say' ? '🎙️ Nói với nhóm' : '⚡ Thả tình huống'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
            placeholder={mode === 'say' ? 'Nhập vai trưởng nhóm, nói gì đó...' : 'VD: Có căn hot Q5 vừa giảm giá...'}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              padding: '6px 9px',
              color: 'white',
              fontSize: 12,
              outline: 'none',
            }}
          />
          <button
            onClick={submit}
            style={{ background: '#FE2C55', color: 'white', border: 'none', borderRadius: 6, padding: '0 12px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
