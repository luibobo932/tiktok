import { useEffect, useRef } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { useEditorStore } from '../store/editorStore'

const ffmpegInstance = new FFmpeg()

export function useFFmpeg() {
  const loaded = useRef(false)
  const setFFmpegReady = useEditorStore((s) => s.setFFmpegReady)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    async function load() {
      const baseURL = '/editor/ffmpeg'
      try {
        // Try multi-thread build first (requires SharedArrayBuffer)
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        })
      } catch {
        // Fallback: single-thread build
        const singleBase = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${singleBase}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${singleBase}/ffmpeg-core.wasm`, 'application/wasm'),
        })
      }

      // Preload font into FFmpeg virtual filesystem
      try {
        const fontResp = await fetch('/editor/fonts/Inter-Regular.ttf')
        if (fontResp.ok) {
          const fontBuf = await fontResp.arrayBuffer()
          await ffmpegInstance.writeFile('font.ttf', new Uint8Array(fontBuf))
        }
      } catch {
        // font unavailable — drawtext will use a fallback
      }

      setFFmpegReady(true)
    }

    load().catch(console.error)
  }, [setFFmpegReady])

  return ffmpegInstance
}

export { fetchFile }
