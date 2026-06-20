import type { VercelRequest, VercelResponse } from '@vercel/node'

interface AnalyzeRequest {
  transcript: string
  clips: { id: string; duration: number }[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { transcript, clips } = req.body as AnalyzeRequest
  if (!transcript || !clips?.length) {
    return res.status(400).json({ error: 'Missing transcript or clips' })
  }

  const prompt = `You are a video editor assistant for house tour / real estate review videos posted on TikTok.

Given the following transcript with timestamps, identify the best segments to keep for a compelling short-form house tour video. Focus on: room descriptions, price mentions, area/size mentions, interesting features, and energetic presenter moments. Remove: dead air, repetitions, off-topic tangents, shaky or confused moments.

Transcript:
${transcript}

Clips info:
${clips.map((c) => `- Clip ID: ${c.id}, duration: ${c.duration.toFixed(1)}s`).join('\n')}

Return a JSON array (no extra text) in this exact format:
[{"clipId": "<id>", "trimIn": <seconds>, "trimOut": <seconds>, "reason": "<brief reason>"}]

Only include clips that need trimming. If a clip is already good as-is, omit it.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return res.status(502).json({ error: 'Claude API error', detail: err })
  }

  const data = await response.json()
  const text: string = data.content?.[0]?.text ?? '[]'

  try {
    const trims = JSON.parse(text)
    return res.json({ trims })
  } catch {
    return res.status(502).json({ error: 'Could not parse Claude response', raw: text })
  }
}
