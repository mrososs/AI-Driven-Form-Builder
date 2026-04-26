import { ref, computed, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useMultiStepFormStore } from '../../../stores/multistepForm'

export type MultiStepPanel = 'canvas' | 'steps' | 'elements' | 'properties'

const activePanel = ref<MultiStepPanel>('canvas')
const isMobile = useMediaQuery('(max-width: 1023px)')

let watcherInitialized = false

export function useMultiStepUI() {
  const store = useMultiStepFormStore()

  if (!watcherInitialized) {
    watcherInitialized = true
    watch(
      () => store.selectedElementId,
      (id) => {
        if (id && isMobile.value) activePanel.value = 'properties'
        if (!id && activePanel.value === 'properties') activePanel.value = 'canvas'
      }
    )
    watch(isMobile, (nowMobile) => {
      if (!nowMobile) activePanel.value = 'canvas'
    })
  }

  const isStepsOpen = computed(() => isMobile.value && activePanel.value === 'steps')
  const isElementsOpen = computed(() => isMobile.value && activePanel.value === 'elements')
  const isPropertiesOpen = computed(() => isMobile.value && activePanel.value === 'properties')

  function setPanel(panel: MultiStepPanel) {
    activePanel.value = panel
  }

  function closeSheets() {
    activePanel.value = 'canvas'
  }

  return {
    activePanel,
    isMobile,
    isStepsOpen,
    isElementsOpen,
    isPropertiesOpen,
    setPanel,
    closeSheets,
  }
}
