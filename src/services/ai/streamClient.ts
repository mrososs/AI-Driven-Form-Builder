export interface SseEvent {
  event: string
  data: unknown
}

export interface StreamHandlers {
  onEvent: (event: SseEvent) => void
  signal?: AbortSignal
  idToken?: string
}

const ENDPOINT = (import.meta.env.VITE_AI_GENERATE_URL as string | undefined) || '/api/generate-form'

/**
 * Streams Server-Sent Events from the AI bridge endpoint.
 * Each `event:` block in the response is delivered to onEvent with its parsed JSON data.
 * Throws on HTTP errors before the stream starts.
 */
export async function streamGenerateForm(
  body: { prompt: string; mode: 'single' | 'multistep' },
  handlers: StreamHandlers,
): Promise<void> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'text/event-stream',
  }
  if (handlers.idToken) {
    headers.authorization = `Bearer ${handlers.idToken}`
  }
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: handlers.signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let message = `AI bridge returned ${response.status}`
    try {
      const parsed = JSON.parse(text)
      if (parsed && typeof parsed.error === 'string') message = parsed.error
    } catch {
      if (text) message = text
    }
    throw new Error(message)
  }

  if (!response.body) {
    throw new Error('AI bridge response has no body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let sepIndex: number
      while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
        const rawBlock = buffer.slice(0, sepIndex)
        buffer = buffer.slice(sepIndex + 2)
        const parsed = parseSseBlock(rawBlock)
        if (parsed) handlers.onEvent(parsed)
      }
    }
    // Flush any final block (server should always end with a separator, but be defensive).
    if (buffer.trim().length > 0) {
      const parsed = parseSseBlock(buffer)
      if (parsed) handlers.onEvent(parsed)
    }
  } finally {
    reader.releaseLock()
  }
}

function parseSseBlock(block: string): SseEvent | null {
  const lines = block.split(/\r?\n/)
  let event = 'message'
  const dataLines: string[] = []
  for (const line of lines) {
    if (line.startsWith(':') || line.length === 0) continue
    const colon = line.indexOf(':')
    const field = colon === -1 ? line : line.slice(0, colon)
    const value = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '')
    if (field === 'event') event = value
    else if (field === 'data') dataLines.push(value)
  }
  if (dataLines.length === 0) return null
  const dataStr = dataLines.join('\n')
  let data: unknown = dataStr
  try {
    data = JSON.parse(dataStr)
  } catch {
    /* leave as string */
  }
  return { event, data }
}
