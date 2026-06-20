export interface Clip {
  id: string
  file: File
  objectUrl: string
  duration: number
  trimIn: number
  trimOut: number
  order: number
  thumbnail?: string
}

export interface Caption {
  id: string
  clipId: string
  text: string
  fontSize: 'small' | 'medium' | 'large'
  color: string
  position: 'top' | 'middle' | 'bottom'
  startTime: number
  endTime: number
}

export type Step = 'upload' | 'arrange' | 'trim' | 'captions' | 'export'

export interface ExportOptions {
  aspectRatio: '9:16' | '4:5' | '16:9'
}
