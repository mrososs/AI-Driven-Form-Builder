import { ref, shallowRef } from 'vue'
import { auth } from '../../../firebase'
import {
  newId,
  useMultiStepFormStore,
  type FormStep,
  type MultiStepElement,
  type MultiStepElementType,
} from '../../../stores/multistepForm'
import { generateMultiStepForm } from '../../../services/ai/generateForm'
import type { GeneratedFormStep } from '../../../schemas/formElement'

function toFormStep(generated: GeneratedFormStep): FormStep {
  const elements: MultiStepElement[] = generated.elements.map((el) => ({
    id: newId(),
    type: el.type as MultiStepElementType,
    label: el.label,
    placeholder: el.placeholder,
    required: el.required,
    options: el.options ? [...el.options] : undefined,
    rangeUnit: el.rangeUnit,
    min: el.min,
    max: el.max,
    step: el.step,
    defaultValue: el.defaultValue,
    cards: el.cards ? el.cards.map((c) => ({ ...c })) : undefined,
  }))

  return {
    id: newId(),
    title: generated.title,
    icon: generated.icon,
    description: generated.description ?? '',
    elements,
  }
}

export function useMultiStepGeneration() {
  const store = useMultiStepFormStore()
  const isGenerating = shallowRef(false)
  const error = shallowRef<string | null>(null)
  const warnings = ref<string[]>([])
  const stepsAdded = shallowRef(0)
  let abort: AbortController | null = null

  async function start(prompt: string) {
    if (isGenerating.value) return

    const currentUser = auth.currentUser
    if (!currentUser) {
      error.value = 'Sign in to use AI generation.'
      return
    }
    if (!currentUser.emailVerified) {
      error.value = 'Verify your email before using AI generation.'
      return
    }

    isGenerating.value = true
    error.value = null
    warnings.value = []
    stepsAdded.value = 0
    abort = new AbortController()

    let idToken: string
    try {
      idToken = await currentUser.getIdToken()
    } catch {
      error.value = 'Could not get auth token. Please sign in again.'
      isGenerating.value = false
      abort = null
      return
    }

    let resetDone = false
    const ensureReset = () => {
      if (resetDone) return
      resetDone = true
      store.steps.splice(0, store.steps.length)
      store.activeStepId = null
      store.selectedElementId = null
      store.rules.splice(0, store.rules.length)
    }

    try {
      await generateMultiStepForm(
        prompt,
        {
          onName: ({ name }) => {
            ensureReset()
            store.formName = name
          },
          onStep: (generatedStep) => {
            ensureReset()
            const next = toFormStep(generatedStep)
            store.steps.push(next)
            if (!store.activeStepId) {
              store.activeStepId = next.id
            }
            stepsAdded.value += 1
          },
          onWarning: (msg) => {
            warnings.value.push(msg)
          },
        },
        { signal: abort.signal, idToken },
      )
      if (resetDone) store.saveDraft()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Generation failed'
    } finally {
      isGenerating.value = false
      abort = null
    }
  }

  function cancel() {
    abort?.abort()
  }

  return { isGenerating, error, warnings, stepsAdded, start, cancel }
}
