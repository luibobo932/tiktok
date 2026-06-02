import { useRef, useState } from 'react'
import { useEditorStore } from '../store/editorStore'

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = (sec % 60).toFixed(1).padStart(4, '0')
  return `${m}:${s}`
}

export default function TrimEditor() {
  const clips = useEditorStore((s) => s.clips)
  const updateClipTrim = useEditorStore((s) => s.updateClipTrim)
  const setCurrentStep = useEditorStore((s) => s.setCurrentStep)
  const sorted = [...clips].sort((a, b) => a.order - b.order)

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {sorted.map((clip) => (
        <ClipTrimCard
          key={clip.id}
          clip={clip}
          onChange={(trimIn, trimOut) => updateClipTrim(clip.id, trimIn, trimOut)}
        />
      ))}
      {sorted.length > 0 && (
        <button
          onClick={() => setCurrentStep('captions')}
          className="w-full bg-brand text-white py-3 rounded-xl font-semibold text-base hover:bg-red-600 transition-colors"
        >
          Tiếp theo: Thêm Caption →
        </button>
      )}
    </div>
  )
}

function ClipTrimCard({
  clip,
  onChange,
}: {
  clip: ReturnType<typeof useEditorStore.getState>['clips'][0]
  onChange: (trimIn: number, trimOut: number) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [trimIn, setTrimIn] = useState(clip.trimIn)
  const [trimOut, setTrimOut] = useState(clip.trimOut)

  const update = (newIn: number, newOut: number) => {
    setTrimIn(newIn)
    setTrimOut(newOut)
    onChange(newIn, newOut)
    if (videoRef.current) videoRef.current.currentTime = newIn
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-700 mb-3 truncate">{clip.file.name}</p>

      {/* 9:16 preview container */}
      <div className="relative mx-auto bg-black rounded-lg overflow-hidden" style={{ width: 160, height: 284 }}>
        <video
          ref={videoRef}
          src={clip.objectUrl}
          className="w-full h-full object-contain"
          playsInline
          muted
          controls={false}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime >= trimOut) {
              e.currentTarget.currentTime = trimIn
            }
          }}
          onClick={(e) => {
            const v = e.currentTarget
            v.paused ? v.play() : v.pause()
          }}
        />
        <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/80">
          tap để play
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Điểm bắt đầu: <span className="font-mono font-semibold text-gray-800">{fmt(trimIn)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={clip.duration}
            step={0.1}
            value={trimIn}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), trimOut - 0.5)
              update(v, trimOut)
            }}
            className="w-full accent-brand"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Điểm kết thúc: <span className="font-mono font-semibold text-gray-800">{fmt(trimOut)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={clip.duration}
            step={0.1}
            value={trimOut}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), trimIn + 0.5)
              update(trimIn, v)
            }}
            className="w-full accent-brand"
          />
        </div>
        <div className="text-xs text-gray-400 text-right">
          Độ dài: <span className="font-semibold text-gray-600">{(trimOut - trimIn).toFixed(1)}s</span>
        </div>
      </div>
    </div>
  )
}
