export interface QwenMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface StreamOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  onDelta: (chunk: string) => void
}

export async function streamQwenChat(messages: QwenMessage[], options: StreamOptions): Promise<string> {
  const response = await fetch('/api/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model ?? 'qwen-plus',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 500,
    }),
  })

  if (!response.ok) {
    throw new Error(`Qwen request failed: ${response.status}`)
  }

  const payload = (await response.json()) as { text?: string }
  const text = (payload.text ?? '').trim()
  if (text) options.onDelta(text)
  return text
}
