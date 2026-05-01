import { ref, shallowRef } from 'vue'
import { auth } from '../../../firebase'
import { useFormStore, type FormElement } from '../../../stores/form'
import { generateSingleForm } from '../../../services/ai/generateForm'
import { newId } from '../elements/utils'
import type { GeneratedFormElement } from '../../../schemas/formElement'

function toFormElement(generated: GeneratedFormElement): FormElement {
  return {
    id: newId(),
    type: generated.type,
    label: generated.label,
    placeholder: generated.placeholder,
    required: generated.required,
    options: generated.options ? [...generated.options] : undefined,
  }
}

export function useFormGeneration() {
  const formStore = useFormStore()
  const isGenerating = shallowRef(false)
  const error = shallowRef<string | null>(null)
  const warnings = ref<string[]>([])
  const elementsAdded = shallowRef(0)
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
    elementsAdded.value = 0
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
      formStore.selectElement(null)
      formStore.setElements([])
    }

    try {
      await generateSingleForm(
        prompt,
        {
          onMeta: ({ title, description }) => {
            ensureReset()
            formStore.title = title
            formStore.description = description
          },
          onElement: (el) => {
            ensureReset()
            formStore.addElement(toFormElement(el))
            elementsAdded.value += 1
          },
          onWarning: (msg) => {
            warnings.value.push(msg)
          },
        },
        { signal: abort.signal, idToken },
      )
      if (resetDone) formStore.saveDraft()
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

  return { isGenerating, error, warnings, elementsAdded, start, cancel }
}
