import { Clip } from '../types'

interface Segment {
  start: number
  end: number
}

const SILENCE_THRESHOLD = 0.02 // RMS amplitude
const SILENCE_MIN_DURATION = 1.5 // seconds
const FRAME_SAMPLE_INTERVAL = 0.5 // seconds
const SHAKE_DIFF_THRESHOLD = 30 // average pixel diff on 160x90

async function detectSilenceWindows(
  objectUrl: string,
  duration: number,
): Promise<Segment[]> {
  const audioCtx = new AudioContext()
  const resp = await fetch(objectUrl)
  const arrayBuf = await resp.arrayBuffer()
  const audioBuf = await audioCtx.decodeAudioData(arrayBuf)
  const data = audioBuf.getChannelData(0)
  const sampleRate = audioBuf.sampleRate
  const windowSize = Math.floor(sampleRate * 0.1)

  const silent: boolean[] = []
  for (let i = 0; i < data.length; i += windowSize) {
    let sum = 0
    for (let j = i; j < Math.min(i + windowSize, data.length); j++) {
      sum += data[j] * data[j]
    }
    silent.push(Math.sqrt(sum / windowSize) < SILENCE_THRESHOLD)
  }

  const segments: Segment[] = []
  let start: number | null = null
  for (let k = 0; k < silent.length; k++) {
    const t = (k * windowSize) / sampleRate
    if (silent[k] && start === null) start = t
    if (!silent[k] && start !== null) {
      if (t - start >= SILENCE_MIN_DURATION) segments.push({ start, end: t })
      start = null
    }
  }
  if (start !== null && duration - start >= SILENCE_MIN_DURATION) {
    segments.push({ start, end: duration })
  }

  audioCtx.close()
  return segments
}

async function detectShakeSegments(
  objectUrl: string,
  duration: number,
): Promise<Segment[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.src = objectUrl
    video.muted = true
    video.playsInline = true

    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 90
    const ctx = canvas.getContext('2d')!

    const diffs: number[] = []
    let prevFrame: ImageData | null = null
    const times: number[] = []

    let t = 0
    const step = FRAME_SAMPLE_INTERVAL

    video.addEventListener('loadedmetadata', () => {
      function sampleNext() {
        if (t > duration) {
          const segments: Segment[] = []
          for (let i = 0; i < diffs.length; i++) {
            if (diffs[i] > SHAKE_DIFF_THRESHOLD) {
              const start = Math.max(0, times[i] - step)
              const end = Math.min(duration, times[i] + step)
              if (segments.length && segments[segments.length - 1].end >= start) {
                segments[segments.length - 1].end = end
              } else {
                segments.push({ start, end })
              }
            }
          }
          resolve(segments)
          return
        }
        video.currentTime = t
      }

      video.addEventListener('seeked', function onSeeked() {
        ctx.drawImage(video, 0, 0, 160, 90)
        const frame = ctx.getImageData(0, 0, 160, 90)
        if (prevFrame) {
          let sum = 0
          for (let i = 0; i < frame.data.length; i += 4) {
            sum += Math.abs(frame.data[i] - prevFrame.data[i])
            sum += Math.abs(frame.data[i + 1] - prevFrame.data[i + 1])
            sum += Math.abs(frame.data[i + 2] - prevFrame.data[i + 2])
          }
          diffs.push(sum / (160 * 90 * 3))
          times.push(t)
        }
        prevFrame = frame
        t += step
        sampleNext()
      })

      sampleNext()
    })

    video.load()
  })
}

function invertSegments(bad: Segment[], duration: number): Segment[] {
  const sorted = [...bad].sort((a, b) => a.start - b.start)
  const good: Segment[] = []
  let cursor = 0
  for (const seg of sorted) {
    if (seg.start - cursor > 0.5) good.push({ start: cursor, end: seg.start })
    cursor = seg.end
  }
  if (duration - cursor > 0.5) good.push({ start: cursor, end: duration })
  return good
}

export async function autoEditClip(
  clip: Clip,
): Promise<{ trimIn: number; trimOut: number }> {
  const [silenceSegs, shakeSegs] = await Promise.all([
    detectSilenceWindows(clip.objectUrl, clip.duration).catch(() => []),
    detectShakeSegments(clip.objectUrl, clip.duration).catch(() => []),
  ])

  const bad = [...silenceSegs, ...shakeSegs]
  if (bad.length === 0) return { trimIn: clip.trimIn, trimOut: clip.trimOut }

  const good = invertSegments(bad, clip.duration)
  if (good.length === 0) return { trimIn: clip.trimIn, trimOut: clip.trimOut }

  // Pick the longest good segment
  const longest = good.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a))
  return { trimIn: longest.start, trimOut: longest.end }
}
