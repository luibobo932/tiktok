import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { Caption } from '../types'
import PreviewPlayer from './PreviewPlayer'

const QUICK_FILL = [
  { label: 'Tên BDS', text: 'Tên bất động sản' },
  { label: 'Giá', text: 'Giá: 0 tỷ' },
  { label: 'Diện tích', text: 'DT: 0m²' },
  { label: 'Phòng ngủ', text: 'Phòng ngủ' },
  { label: 'Phòng khách', text: 'Phòng khách' },
  { label: 'Nhà bếp', text: 'Nhà bếp' },
]

const COLORS = [
  { label: 'Trắng', value: 'white' },
  { label: 'Vàng', value: '#FFD700' },
  { label: 'Đỏ', value: '#fe2c55' },
  { label: 'Đen', value: 'black' },
]

function generateId() {
  return Math.random().toString(36).slice(2)
}

export default function CaptionEditor() {
  const clips = useEditorStore((s) => s.clips)
  const captions = useEditorStore((s) => s.captions)
  const addCaption = useEditorStore((s) => s.addCaption)
  const removeCaption = useEditorStore((s) => s.removeCaption)
  const setCurrentStep = useEditorStore((s) => s.setCurrentStep)

  const sorted = [...clips].sort((a, b) => a.order - b.order)
  const [selectedClipId, setSelectedClipId] = useState(sorted[0]?.id ?? '')

  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState<Caption['fontSize']>('medium')
  const [color, setColor] = useState('white')
  const [position, setPosition] = useState<Caption['position']>('bottom')
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(5)

  const selectedClip = sorted.find((c) => c.id === selectedClipId)
  const clipCaptions = captions.filter((c) => c.clipId === selectedClipId)

  const handleAdd = () => {
    if (!text.trim() || !selectedClipId) return
    addCaption({
      id: generateId(),
      clipId: selectedClipId,
      text: text.trim(),
      fontSize,
      color,
      position,
      startTime,
      endTime,
    })
    setText('')
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Clip selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sorted.map((clip, i) => (
          <button
            key={clip.id}
            onClick={() => setSelectedClipId(clip.id)}
            className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
              clip.id === selectedClipId ? 'border-brand' : 'border-transparent'
            }`}
          >
            <div className="w-16 h-10 bg-gray-200 relative">
              {clip.thumbnail && (
                <img src={clip.thumbnail} alt="" className="w-full h-full object-cover" />
              )}
              <span className="absolute bottom-0 right-0 text-xs text-white bg-black/60 px-1">
                {i + 1}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-start">
        {/* Preview */}
        {selectedClip && (
          <div className="shrink-0">
            <PreviewPlayer clip={selectedClip} captions={clipCaptions} />
          </div>
        )}

        {/* Form */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Quick fill */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Điền nhanh</p>
            <div className="flex flex-wrap gap-1">
              {QUICK_FILL.map((q) => (
                <button
                  key={q.label}
                  onClick={() => setText(q.text)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nội dung chữ..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />

          {/* Font size */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Cỡ chữ</p>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    fontSize === s
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {s === 'small' ? 'Nhỏ' : s === 'medium' ? 'Vừa' : 'Lớn'}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Màu chữ</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value ? 'border-brand scale-110' : 'border-gray-200'
                  }`}
                  style={{ background: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Vị trí</p>
            <div className="flex gap-2">
              {(['top', 'middle', 'bottom'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPosition(p)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    position === p
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {p === 'top' ? 'Trên' : p === 'middle' ? 'Giữa' : 'Dưới'}
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          {selectedClip && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Từ (giây)</label>
                <input
                  type="number"
                  min={0}
                  max={selectedClip.duration}
                  step={0.5}
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Đến (giây)</label>
                <input
                  type="number"
                  min={0}
                  max={selectedClip.duration}
                  step={0.5}
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            className="flex items-center justify-center gap-2 bg-brand text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-red-600 transition-colors"
          >
            <Plus size={16} /> Thêm caption
          </button>
        </div>
      </div>

      {/* Caption list */}
      {clipCaptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 font-semibold">Caption đã thêm ({clipCaptions.length})</p>
          {clipCaptions.map((cap) => (
            <div
              key={cap.id}
              className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: cap.color, border: '1px solid #ddd' }}
              />
              <span className="flex-1 text-sm text-gray-800 truncate">{cap.text}</span>
              <span className="text-xs text-gray-400">
                {cap.startTime}s–{cap.endTime}s
              </span>
              <button
                onClick={() => removeCaption(cap.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setCurrentStep('export')}
        className="w-full bg-brand text-white py-3 rounded-xl font-semibold text-base hover:bg-red-600 transition-colors"
      >
        Tiếp theo: Xuất video →
      </button>
    </div>
  )
}
