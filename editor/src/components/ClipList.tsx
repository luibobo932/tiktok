import { useState } from 'react'
import { GripVertical, Trash2, Wand2 } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { autoEditClip } from '../lib/autoEdit'

export default function ClipList() {
  const clips = useEditorStore((s) => s.clips)
  const removeClip = useEditorStore((s) => s.removeClip)
  const reorderClips = useEditorStore((s) => s.reorderClips)
  const applySuggestedTrims = useEditorStore((s) => s.applySuggestedTrims)
  const setCurrentStep = useEditorStore((s) => s.setCurrentStep)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const sorted = [...clips].sort((a, b) => a.order - b.order)

  const handleMagicEdit = async () => {
    setIsAnalyzing(true)
    try {
      const results = await Promise.all(sorted.map((clip) => autoEditClip(clip)))
      applySuggestedTrims(results.map((r, i) => ({ clipId: sorted[i].id, ...r })))
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{sorted.length} clip — kéo để sắp xếp thứ tự</p>
        <button
          onClick={handleMagicEdit}
          disabled={isAnalyzing || sorted.length === 0}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Wand2 size={16} />
          {isAnalyzing ? 'Đang phân tích...' : 'Magic Edit'}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((clip, index) => (
          <div
            key={clip.id}
            draggable
            onDragStart={() => setDragFrom(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragFrom !== null && dragFrom !== index) {
                reorderClips(dragFrom, index)
              }
              setDragFrom(null)
            }}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={20} className="text-gray-300 shrink-0" />
            <div className="w-20 h-12 rounded overflow-hidden bg-gray-100 shrink-0">
              {clip.thumbnail && (
                <img src={clip.thumbnail} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{clip.file.name}</p>
              <p className="text-xs text-gray-400">
                {clip.trimIn.toFixed(1)}s – {clip.trimOut.toFixed(1)}s
                &nbsp;({(clip.trimOut - clip.trimIn).toFixed(1)}s)
              </p>
            </div>
            <span className="text-xs font-bold text-gray-400 w-6 text-center shrink-0">
              {index + 1}
            </span>
            <button
              onClick={() => removeClip(clip.id)}
              className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {sorted.length > 0 && (
        <button
          onClick={() => setCurrentStep('trim')}
          className="mt-2 w-full bg-brand text-white py-3 rounded-xl font-semibold text-base hover:bg-red-600 transition-colors"
        >
          Tiếp theo: Cắt / Trim →
        </button>
      )}
    </div>
  )
}
