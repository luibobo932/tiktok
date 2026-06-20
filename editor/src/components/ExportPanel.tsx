import { useState } from 'react'
import { Download, Film } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { useFFmpeg } from '../hooks/useFFmpeg'
import { processAndMergeClips } from '../lib/ffmpegService'
import { ExportOptions } from '../types'

const ASPECT_OPTIONS: { value: ExportOptions['aspectRatio']; label: string; desc: string }[] = [
  { value: '9:16', label: '9:16', desc: 'TikTok / Reels (dọc)' },
  { value: '4:5', label: '4:5', desc: 'Instagram Feed' },
  { value: '16:9', label: '16:9', desc: 'YouTube / ngang' },
]

export default function ExportPanel() {
  const clips = useEditorStore((s) => s.clips)
  const captions = useEditorStore((s) => s.captions)
  const exportOptions = useEditorStore((s) => s.exportOptions)
  const setExportOptions = useEditorStore((s) => s.setExportOptions)
  const isFFmpegReady = useEditorStore((s) => s.isFFmpegReady)
  const exportProgress = useEditorStore((s) => s.exportProgress)
  const exportUrl = useEditorStore((s) => s.exportUrl)
  const setExportProgress = useEditorStore((s) => s.setExportProgress)
  const setExportUrl = useEditorStore((s) => s.setExportUrl)

  const ffmpeg = useFFmpeg()
  const [isExporting, setIsExporting] = useState(false)

  const totalDuration = clips.reduce((sum, c) => sum + (c.trimOut - c.trimIn), 0)

  const handleExport = async () => {
    if (isExporting || !isFFmpegReady || clips.length === 0) return
    setIsExporting(true)
    setExportProgress(0)
    setExportUrl(null)
    try {
      const data = await processAndMergeClips(
        ffmpeg,
        clips,
        captions,
        exportOptions,
        setExportProgress,
      )
      // Copy to a plain ArrayBuffer to avoid SharedArrayBuffer Blob restrictions
      const plain = new Uint8Array(data).buffer as ArrayBuffer
      const blob = new Blob([plain], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      setExportUrl(url)
    } catch (err) {
      console.error(err)
      alert('Xuất video thất bại. Vui lòng thử lại.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-6">
        <div className="text-center flex-1">
          <p className="text-2xl font-bold text-gray-800">{clips.length}</p>
          <p className="text-xs text-gray-500">clip</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-2xl font-bold text-gray-800">{totalDuration.toFixed(1)}s</p>
          <p className="text-xs text-gray-500">tổng thời lượng</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-2xl font-bold text-gray-800">{captions.length}</p>
          <p className="text-xs text-gray-500">caption</p>
        </div>
      </div>

      {/* Aspect ratio */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Tỉ lệ khung hình</p>
        <div className="flex gap-3">
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setExportOptions({ aspectRatio: opt.value })}
              className={`flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                exportOptions.aspectRatio === opt.value
                  ? 'border-brand bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span className="font-bold text-sm text-gray-800">{opt.label}</span>
              <span className="text-xs text-gray-400 mt-1 text-center leading-tight">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FFmpeg status */}
      {!isFFmpegReady && (
        <div className="text-sm text-gray-400 text-center animate-pulse">
          Đang tải bộ xử lý video...
        </div>
      )}

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !isFFmpegReady || clips.length === 0}
        className="flex items-center justify-center gap-3 bg-brand text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50 hover:bg-red-600 transition-colors"
      >
        <Film size={20} />
        {isExporting ? 'Đang xử lý...' : 'Xuất video'}
      </button>

      {/* Progress */}
      {isExporting && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Xử lý với FFmpeg...</span>
            <span>{exportProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Download */}
      {exportUrl && (
        <div className="flex flex-col items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-700">Video đã sẵn sàng!</p>
          <video
            src={exportUrl}
            controls
            className="rounded-lg max-h-64 w-full"
            style={{ maxWidth: 180 }}
          />
          <a
            href={exportUrl}
            download="house-review.mp4"
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            <Download size={18} /> Tải xuống MP4
          </a>
        </div>
      )}
    </div>
  )
}
