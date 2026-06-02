import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { Clip, Caption, ExportOptions } from '../types'

const FONT_SIZE_MAP = { small: 36, medium: 52, large: 72 }
const POSITION_MAP = {
  top: '80',
  middle: '(h-text_h)/2',
  bottom: 'h-120',
}

function escapeDrawtext(text: string) {
  return text.replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/\\/g, '\\\\')
}

function buildDrawtextFilter(captions: Caption[]): string {
  if (captions.length === 0) return ''
  return captions
    .map((cap) => {
      const size = FONT_SIZE_MAP[cap.fontSize]
      const y = POSITION_MAP[cap.position]
      const text = escapeDrawtext(cap.text)
      return (
        `drawtext=fontfile=/font.ttf:text='${text}':fontsize=${size}` +
        `:fontcolor=${cap.color}:x=(w-text_w)/2:y=${y}` +
        `:enable='between(t\\,${cap.startTime}\\,${cap.endTime})'` +
        `:shadowcolor=black:shadowx=2:shadowy=2`
      )
    })
    .join(',')
}

function scaleFilter(aspectRatio: ExportOptions['aspectRatio']): string {
  const dims: Record<string, string> = {
    '9:16': '1080:1920',
    '4:5': '1080:1350',
    '16:9': '1920:1080',
  }
  const [w, h] = dims[aspectRatio].split(':')
  return (
    `scale=${w}:${h}:force_original_aspect_ratio=decrease,` +
    `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black`
  )
}

export async function processAndMergeClips(
  ffmpeg: FFmpeg,
  clips: Clip[],
  captions: Caption[],
  options: ExportOptions,
  onProgress: (p: number) => void,
): Promise<Uint8Array> {
  const sorted = [...clips].sort((a, b) => a.order - b.order)
  const processedNames: string[] = []

  for (let i = 0; i < sorted.length; i++) {
    const clip = sorted[i]
    const inName = `input_${i}.mp4`
    const outName = `clip_${i}.mp4`

    await ffmpeg.writeFile(inName, await fetchFile(clip.file))

    const clipCaptions = captions.filter((c) => c.clipId === clip.id)
    const drawtextFilter = buildDrawtextFilter(clipCaptions)
    const scale = scaleFilter(options.aspectRatio)

    let vfChain = scale
    if (drawtextFilter) vfChain = `${scale},${drawtextFilter}`

    await ffmpeg.exec([
      '-i', inName,
      '-ss', String(clip.trimIn),
      '-to', String(clip.trimOut),
      '-vf', vfChain,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      outName,
    ])

    processedNames.push(outName)
    onProgress(Math.round(((i + 1) / sorted.length) * 80))
  }

  if (processedNames.length === 1) {
    const data = await ffmpeg.readFile(processedNames[0])
    return data as Uint8Array
  }

  // Write concat list
  const concatContent = processedNames.map((n) => `file '${n}'`).join('\n')
  const encoder = new TextEncoder()
  await ffmpeg.writeFile('concat.txt', encoder.encode(concatContent))

  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'concat.txt',
    '-c', 'copy',
    'final.mp4',
  ])

  onProgress(100)
  const data = await ffmpeg.readFile('final.mp4')
  return data as Uint8Array
}

export async function extractAudioWav(ffmpeg: FFmpeg, clip: Clip): Promise<Uint8Array> {
  const inName = `audio_in_${clip.id}.mp4`
  const outName = `audio_out_${clip.id}.wav`
  await ffmpeg.writeFile(inName, await fetchFile(clip.file))
  await ffmpeg.exec([
    '-i', inName,
    '-ss', String(clip.trimIn),
    '-to', String(clip.trimOut),
    '-vn',
    '-ar', '16000',
    '-ac', '1',
    '-f', 'wav',
    outName,
  ])
  const data = await ffmpeg.readFile(outName)
  return data as Uint8Array
}
