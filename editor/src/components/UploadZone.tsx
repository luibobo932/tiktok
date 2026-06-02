import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { useEditorStore } from '../store/editorStore'
import { Clip } from '../types'

function generateId() {
  return Math.random().toString(36).slice(2)
}

async function extractDuration(objectUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.src = objectUrl
    v.onloadedmetadata = () => resolve(v.duration)
    v.onerror = () => resolve(0)
    v.load()
  })
}

async function extractThumbnail(objectUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.src = objectUrl
    v.currentTime = 0.5
    v.muted = true
    v.playsInline = true
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 90
    const ctx = canvas.getContext('2d')!
    v.onseeked = () => {
      ctx.drawImage(v, 0, 0, 160, 90)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    v.onerror = () => resolve('')
    v.load()
  })
}

export default function UploadZone() {
  const addClips = useEditorStore((s) => s.addClips)
  const clips = useEditorStore((s) => s.clips)
  const setCurrentStep = useEditorStore((s) => s.setCurrentStep)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'video/mp4': ['.mp4'], 'video/quicktime': ['.mov'], 'video/*': [] },
    onDrop: async (files) => {
      const newClips: Clip[] = await Promise.all(
        files.map(async (file) => {
          const objectUrl = URL.createObjectURL(file)
          const duration = await extractDuration(objectUrl)
          const thumbnail = await extractThumbnail(objectUrl)
          return {
            id: generateId(),
            file,
            objectUrl,
            duration,
            trimIn: 0,
            trimOut: duration,
            order: 0,
            thumbnail,
          }
        }),
      )
      addClips(newClips)
    },
  })

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`w-full border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors
          ${isDragActive ? 'border-brand bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-brand hover:bg-red-50'}`}
      >
        <input {...getInputProps()} />
        <Upload size={48} className={isDragActive ? 'text-brand' : 'text-gray-400'} />
        <p className="text-lg font-semibold text-gray-700 text-center">
          {isDragActive ? 'Thả video vào đây...' : 'Kéo thả video hoặc nhấn để chọn file'}
        </p>
        <p className="text-sm text-gray-400">Hỗ trợ MP4, MOV — nhiều file cùng lúc</p>
      </div>

      {clips.length > 0 && (
        <div className="w-full">
          <p className="text-sm text-gray-500 mb-3">
            Đã thêm <span className="font-semibold text-gray-800">{clips.length}</span> clip
          </p>
          <div className="flex gap-3 flex-wrap">
            {clips.map((clip) => (
              <div key={clip.id} className="relative rounded-lg overflow-hidden w-28 h-16 bg-gray-200 shadow">
                {clip.thumbnail && (
                  <img src={clip.thumbnail} alt="" className="w-full h-full object-cover" />
                )}
                <span className="absolute bottom-1 right-1 text-xs text-white bg-black/60 rounded px-1">
                  {clip.duration.toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setCurrentStep('arrange')}
            className="mt-6 w-full bg-brand text-white py-3 rounded-xl font-semibold text-base hover:bg-red-600 transition-colors"
          >
            Tiếp theo: Sắp xếp clip →
          </button>
        </div>
      )}
    </div>
  )
}
