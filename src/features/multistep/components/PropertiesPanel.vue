<script setup lang="ts">
import { ref, watch } from 'vue'
import { Settings2, X } from 'lucide-vue-next'
import { useMultiStepFormStore } from '../../../stores/multistepForm'
import FieldProps from './FieldProps.vue'
import StepProps from './StepProps.vue'
import FlowProps from './FlowProps.vue'
import { useMultiStepUI } from '../composables/useMultiStepUI'

type InspectorTab = 'field' | 'step' | 'flow'

const store = useMultiStepFormStore()
const { isPropertiesOpen, isMobile, closeSheets } = useMultiStepUI()
const tab = ref<InspectorTab>('field')

const tabs: Array<{ key: InspectorTab; label: string }> = [
  { key: 'field', label: 'Field' },
  { key: 'step', label: 'Step' },
  { key: 'flow', label: 'Flow' },
]

watch(
  () => store.selectedElement?.id,
  (id) => {
    if (id) tab.value = 'field'
  }
)

function tabClass(key: InspectorTab) {
  const base =
    'flex-1 px-2 py-1.5 rounded-md text-[12px] font-semibold capitalize transition-all'
  return tab.value === key
    ? `${base} bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-500/30`
    : `${base} text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white`
}

function close() {
  store.selectElement(null)
  if (isMobile.value) closeSheets()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isPropertiesOpen"
      @click="closeSheets"
      class="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-30 lg:hidden"
      aria-hidden="true"
    />
  </Transition>

  <aside
    :class="[
      'bg-white dark:bg-[#111118] flex flex-col',
      'lg:static lg:w-72 xl:w-80 lg:shrink-0 lg:translate-y-0 lg:border-s lg:border-slate-200 lg:dark:border-white/[0.07] lg:rounded-none lg:shadow-none lg:max-h-none lg:transition-none',
      'fixed inset-x-0 bottom-[52px] z-40 max-h-[70vh] rounded-t-2xl border-t border-slate-200 dark:border-white/[0.07] shadow-2xl shadow-black/20 dark:shadow-black/60 transition-transform duration-300 ease-out',
      isPropertiesOpen ? 'translate-y-0' : 'translate-y-[calc(100%+52px)] lg:translate-y-0',
    ]"
    aria-label="Inspector"
  >
    <div class="px-5 pt-5 pb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Settings2 class="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <h2 class="font-bold text-slate-900 dark:text-white text-base font-heading">Inspector</h2>
      </div>
      <button
        type="button"
        @click="close"
        class="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/[0.07] rounded-lg"
        aria-label="Close inspector"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <div class="px-5 pb-3">
      <div class="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          :class="tabClass(t.key)"
          @click="tab = t.key"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto scrollbar-thin px-5 pb-5 space-y-5">
      <template v-if="tab === 'field'">
        <FieldProps
          v-if="store.selectedElement"
          :element="store.selectedElement"
          @update="(patch) => store.selectedElement && store.updateElement(store.selectedElement.id, patch)"
        />
        <div v-else class="h-48 flex items-center justify-center text-center">
          <p class="text-xs text-slate-500 dark:text-white/30 leading-relaxed font-medium max-w-[220px]">
            Select a field on the canvas to edit it.
          </p>
        </div>
      </template>

      <StepProps
        v-else-if="tab === 'step' && store.activeStep"
        :step="store.activeStep"
        @update="(patch) => store.activeStep && store.updateStep(store.activeStep.id, patch)"
      />

      <FlowProps v-else-if="tab === 'flow'" />
    </div>
  </aside>
</template>
