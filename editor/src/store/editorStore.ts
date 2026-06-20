import { create } from 'zustand'
import { Clip, Caption, Step, ExportOptions } from '../types'

interface EditorState {
  clips: Clip[]
  captions: Caption[]
  currentStep: Step
  selectedClipId: string | null
  isFFmpegReady: boolean
  exportProgress: number
  exportUrl: string | null
  exportOptions: ExportOptions

  addClips: (clips: Clip[]) => void
  removeClip: (id: string) => void
  reorderClips: (fromIndex: number, toIndex: number) => void
  updateClipTrim: (id: string, trimIn: number, trimOut: number) => void
  setClipThumbnail: (id: string, thumbnail: string) => void

  addCaption: (caption: Caption) => void
  updateCaption: (id: string, patch: Partial<Caption>) => void
  removeCaption: (id: string) => void

  setCurrentStep: (step: Step) => void
  setSelectedClipId: (id: string | null) => void
  setFFmpegReady: (ready: boolean) => void
  setExportProgress: (progress: number) => void
  setExportUrl: (url: string | null) => void
  setExportOptions: (opts: Partial<ExportOptions>) => void

  applySuggestedTrims: (trims: { clipId: string; trimIn: number; trimOut: number }[]) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  clips: [],
  captions: [],
  currentStep: 'upload',
  selectedClipId: null,
  isFFmpegReady: false,
  exportProgress: 0,
  exportUrl: null,
  exportOptions: { aspectRatio: '9:16' },

  addClips: (newClips) =>
    set((s) => ({
      clips: [
        ...s.clips,
        ...newClips.map((c, i) => ({ ...c, order: s.clips.length + i })),
      ],
    })),

  removeClip: (id) =>
    set((s) => ({
      clips: s.clips.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })),
      captions: s.captions.filter((cap) => cap.clipId !== id),
    })),

  reorderClips: (fromIndex, toIndex) =>
    set((s) => {
      const clips = [...s.clips].sort((a, b) => a.order - b.order)
      const [moved] = clips.splice(fromIndex, 1)
      clips.splice(toIndex, 0, moved)
      return { clips: clips.map((c, i) => ({ ...c, order: i })) }
    }),

  updateClipTrim: (id, trimIn, trimOut) =>
    set((s) => ({
      clips: s.clips.map((c) => (c.id === id ? { ...c, trimIn, trimOut } : c)),
    })),

  setClipThumbnail: (id, thumbnail) =>
    set((s) => ({
      clips: s.clips.map((c) => (c.id === id ? { ...c, thumbnail } : c)),
    })),

  addCaption: (caption) =>
    set((s) => ({ captions: [...s.captions, caption] })),

  updateCaption: (id, patch) =>
    set((s) => ({
      captions: s.captions.map((cap) => (cap.id === id ? { ...cap, ...patch } : cap)),
    })),

  removeCaption: (id) =>
    set((s) => ({ captions: s.captions.filter((cap) => cap.id !== id) })),

  setCurrentStep: (step) => set({ currentStep: step }),
  setSelectedClipId: (id) => set({ selectedClipId: id }),
  setFFmpegReady: (ready) => set({ isFFmpegReady: ready }),
  setExportProgress: (progress) => set({ exportProgress: progress }),
  setExportUrl: (url) => set({ exportUrl: url }),
  setExportOptions: (opts) =>
    set((s) => ({ exportOptions: { ...s.exportOptions, ...opts } })),

  applySuggestedTrims: (trims) =>
    set((s) => ({
      clips: s.clips.map((c) => {
        const t = trims.find((t) => t.clipId === c.id)
        return t ? { ...c, trimIn: t.trimIn, trimOut: t.trimOut } : c
      }),
    })),
}))
