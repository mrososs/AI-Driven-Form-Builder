import { ref, computed, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useFormStore } from '../stores/form'

export type BuilderPanel = 'canvas' | 'elements' | 'properties'

const activePanel = ref<BuilderPanel>('canvas')
const isMobile = useMediaQuery('(max-width: 767px)')

let watcherInitialized = false

export function useBuilderUI() {
  const formStore = useFormStore()

  if (!watcherInitialized) {
    watcherInitialized = true
    // When an element is selected on mobile, surface the properties sheet.
    watch(
      () => formStore.selectedElementId,
      (id) => {
        if (id && isMobile.value) activePanel.value = 'properties'
        if (!id && activePanel.value === 'properties') activePanel.value = 'canvas'
      }
    )
    // When crossing the breakpoint back up to desktop, reset to canvas so
    // sheets aren't stuck "open" beneath a now-always-visible panel.
    watch(isMobile, (nowMobile) => {
      if (!nowMobile) activePanel.value = 'canvas'
    })
  }

  const isElementsOpen = computed(() => isMobile.value && activePanel.value === 'elements')
  const isPropertiesOpen = computed(() => isMobile.value && activePanel.value === 'properties')

  function setPanel(panel: BuilderPanel) {
    activePanel.value = panel
  }

  function closeSheets() {
    activePanel.value = 'canvas'
  }

  return {
    activePanel,
    isMobile,
    isElementsOpen,
    isPropertiesOpen,
    setPanel,
    closeSheets,
  }
}
