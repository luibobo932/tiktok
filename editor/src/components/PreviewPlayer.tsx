import { useEffect, useRef } from 'react'
import { Caption, Clip } from '../types'
import { drawCaptions } from '../lib/captionRenderer'

interface Props {
  clip: Clip
  captions: Caption[]
}

export default function PreviewPlayer({ clip, captions }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')!

    function render() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      drawCaptions(ctx, captions, video!.currentTime, canvas!.width, canvas!.height)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [captions])

  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden mx-auto"
      style={{ width: 180, height: 320 }}
    >
      <video
        ref={videoRef}
        src={clip.objectUrl}
        className="w-full h-full object-contain"
        playsInline
        loop
        controls={false}
        onClick={(e) => {
          const v = e.currentTarget
          v.paused ? v.play() : v.pause()
        }}
      />
      <canvas
        ref={canvasRef}
        width={180}
        height={320}
        className="absolute inset-0 pointer-events-none"
      />
      <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/60">
        tap để play
      </p>
    </div>
  )
}
