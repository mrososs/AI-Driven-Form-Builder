import { ref, readonly } from 'vue'

export interface TourStep {
  target: string
  title: string
  body: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const SEEN_KEY = 'logic-tour-seen'

export function useTour(steps: TourStep[], storageKey = SEEN_KEY) {
  const active = ref(false)
  const stepIndex = ref(0)

  function start(force = false) {
    if (!force && localStorage.getItem(storageKey)) return
    stepIndex.value = 0
    active.value = true
  }

  function forceStart() {
    start(true)
  }

  function next() {
    if (stepIndex.value < steps.length - 1) {
      stepIndex.value++
    } else {
      end()
    }
  }

  function prev() {
    if (stepIndex.value > 0) stepIndex.value--
  }

  function end() {
    active.value = false
    localStorage.setItem(storageKey, '1')
  }

  return {
    active: readonly(active),
    stepIndex: readonly(stepIndex),
    currentStep: () => steps[stepIndex.value],
    totalSteps: steps.length,
    start,
    forceStart,
    next,
    prev,
    end,
  }
}
