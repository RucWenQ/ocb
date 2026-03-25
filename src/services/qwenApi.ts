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

const DEFAULT_ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

export async function streamQwenChat(messages: QwenMessage[], options: StreamOptions): Promise<string> {
  const apiKey = import.meta.env.VITE_QWEN_API_KEY as string | undefined
  const endpoint = (import.meta.env.VITE_QWEN_API_ENDPOINT as string | undefined) ?? DEFAULT_ENDPOINT
  if (!apiKey) {
    throw new Error('VITE_QWEN_API_KEY is missing')
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model ?? (import.meta.env.VITE_QWEN_MODEL as string | undefined) ?? 'qwen-plus',
      messages,
      stream: true,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 500,
    }),
  })

  if (!response.ok || !response.body) {
    throw new Error(`Qwen request failed: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let done = false
  let buffer = ''
  let fullText = ''

  while (!done) {
    const chunkResult = await reader.read()
    done = chunkResult.done
    buffer += decoder.decode(chunkResult.value ?? new Uint8Array(), { stream: !done })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line.startsWith('data: ')) continue
      if (line === 'data: [DONE]') continue

      try {
        const data = JSON.parse(line.slice(6)) as {
          choices?: Array<{ delta?: { content?: string } }>
        }
        const delta = data.choices?.[0]?.delta?.content ?? ''
        if (!delta) continue
        fullText += delta
        options.onDelta(delta)
      } catch {
        continue
      }
    }
  }

  return fullText.trim()
}
