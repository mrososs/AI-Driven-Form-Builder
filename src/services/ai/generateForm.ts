import {
  formMetaSchema,
  formNameSchema,
  generatedFormElementSchema,
  generatedFormStepSchema,
  type GeneratedFormElement,
  type GeneratedFormMeta,
  type GeneratedFormName,
  type GeneratedFormStep,
} from '../../schemas/formElement'
import { streamGenerateForm, type SseEvent } from './streamClient'

export interface SingleFormGenerationCallbacks {
  onMeta?: (meta: GeneratedFormMeta) => void
  onElement?: (element: GeneratedFormElement) => void
  onWarning?: (message: string) => void
}

export interface MultiStepFormGenerationCallbacks {
  onName?: (name: GeneratedFormName) => void
  onStep?: (step: GeneratedFormStep) => void
  onWarning?: (message: string) => void
}

interface GenerateOptions {
  signal?: AbortSignal
  idToken?: string
}

interface ToolEventPayload {
  name?: string
  input?: unknown
}

interface ErrorEventPayload {
  message?: string
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function extractToolPayload(data: unknown): ToolEventPayload | null {
  if (!isObject(data)) return null
  return data as ToolEventPayload
}

function extractErrorMessage(data: unknown): string {
  if (!isObject(data)) return 'Unknown error'
  const payload = data as ErrorEventPayload
  return typeof payload.message === 'string' && payload.message.length > 0
    ? payload.message
    : 'Unknown error'
}

export async function generateSingleForm(
  prompt: string,
  callbacks: SingleFormGenerationCallbacks,
  options: GenerateOptions = {},
): Promise<void> {
  let streamError: Error | null = null

  await streamGenerateForm(
    { prompt, mode: 'single' },
    {
      signal: options.signal,
      idToken: options.idToken,
      onEvent: (event: SseEvent) => {
        if (event.event === 'error') {
          streamError = new Error(extractErrorMessage(event.data))
          return
        }
        if (event.event !== 'tool') return

        const payload = extractToolPayload(event.data)
        if (!payload) return

        if (payload.name === 'set_form_meta') {
          const result = formMetaSchema.safeParse(payload.input)
          if (result.success) callbacks.onMeta?.(result.data)
          else callbacks.onWarning?.(`Invalid form meta: ${result.error.issues[0]?.message}`)
          return
        }

        if (payload.name === 'emit_element') {
          const result = generatedFormElementSchema.safeParse(payload.input)
          if (result.success) callbacks.onElement?.(result.data)
          else callbacks.onWarning?.(`Skipped invalid element: ${result.error.issues[0]?.message}`)
        }
      },
    },
  )

  if (streamError) throw streamError
}

export async function generateMultiStepForm(
  prompt: string,
  callbacks: MultiStepFormGenerationCallbacks,
  options: GenerateOptions = {},
): Promise<void> {
  let streamError: Error | null = null

  await streamGenerateForm(
    { prompt, mode: 'multistep' },
    {
      signal: options.signal,
      idToken: options.idToken,
      onEvent: (event: SseEvent) => {
        if (event.event === 'error') {
          streamError = new Error(extractErrorMessage(event.data))
          return
        }
        if (event.event !== 'tool') return

        const payload = extractToolPayload(event.data)
        if (!payload) return

        if (payload.name === 'set_form_name') {
          const result = formNameSchema.safeParse(payload.input)
          if (result.success) callbacks.onName?.(result.data)
          else callbacks.onWarning?.(`Invalid form name: ${result.error.issues[0]?.message}`)
          return
        }

        if (payload.name === 'emit_step') {
          const result = generatedFormStepSchema.safeParse(payload.input)
          if (result.success) callbacks.onStep?.(result.data)
          else callbacks.onWarning?.(`Skipped invalid step: ${result.error.issues[0]?.message}`)
        }
      },
    },
  )

  if (streamError) throw streamError
}
