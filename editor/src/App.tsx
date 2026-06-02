import { useFFmpeg } from './hooks/useFFmpeg'
import { useEditorStore } from './store/editorStore'
import UploadZone from './components/UploadZone'
import ClipList from './components/ClipList'
import TrimEditor from './components/TrimEditor'
import CaptionEditor from './components/CaptionEditor'
import ExportPanel from './components/ExportPanel'
import { Step } from './types'

const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'arrange', label: 'Sắp xếp' },
  { id: 'trim', label: 'Cắt' },
  { id: 'captions', label: 'Caption' },
  { id: 'export', label: 'Xuất' },
]

const STEP_ORDER: Step[] = ['upload', 'arrange', 'trim', 'captions', 'export']

export default function App() {
  // Initialize FFmpeg on mount
  useFFmpeg()

  const currentStep = useEditorStore((s) => s.currentStep)
  const setCurrentStep = useEditorStore((s) => s.setCurrentStep)
  const clips = useEditorStore((s) => s.clips)

  const currentIndex = STEP_ORDER.indexOf(currentStep)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-black text-white px-4 py-3 flex items-center gap-3 shadow">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-bold text-sm">
          HR
        </div>
        <h1 className="font-bold text-base">House Review Editor</h1>
        <span className="ml-auto text-xs text-gray-400">{clips.length} clip</span>
      </header>

      {/* Step indicator */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center max-w-2xl mx-auto">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (i <= currentIndex || clips.length > 0) setCurrentStep(step.id)
                }}
                className={`flex flex-col items-center gap-0.5 group transition-all`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < currentIndex
                      ? 'bg-brand text-white'
                      : i === currentIndex
                      ? 'bg-brand text-white ring-4 ring-red-100'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {i < currentIndex ? '✓' : i + 1}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    i === currentIndex ? 'text-brand' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-colors ${
                    i < currentIndex ? 'bg-brand' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        {currentStep === 'upload' && <UploadZone />}
        {currentStep === 'arrange' && <ClipList />}
        {currentStep === 'trim' && <TrimEditor />}
        {currentStep === 'captions' && <CaptionEditor />}
        {currentStep === 'export' && <ExportPanel />}
      </main>
    </div>
  )
}
