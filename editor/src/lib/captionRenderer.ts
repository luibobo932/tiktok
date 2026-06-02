import { Caption } from '../types'

const FONT_SIZE_MAP = { small: 28, medium: 42, large: 60 }

export function drawCaptions(
  ctx: CanvasRenderingContext2D,
  captions: Caption[],
  currentTime: number,
  width: number,
  height: number,
) {
  const active = captions.filter(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime,
  )

  for (const cap of active) {
    const size = FONT_SIZE_MAP[cap.fontSize]
    ctx.font = `bold ${size}px Inter, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    const x = width / 2
    let y: number
    if (cap.position === 'top') y = 80 + size
    else if (cap.position === 'middle') y = height / 2
    else y = height - 80

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    ctx.fillStyle = cap.color
    ctx.fillText(cap.text, x, y)

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  }
}
