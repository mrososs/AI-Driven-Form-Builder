<script setup lang="ts">
import { ref, watch } from 'vue'
import { Settings2, X } from 'lucide-vue-next'
import { useMultiStepFormStore } from '../../../stores/multistepForm'
import FieldProps from './FieldProps.vue'
import StepProps from './StepProps.vue'
import FlowProps from './FlowProps.vue'

type InspectorTab = 'field' | 'step' | 'flow'

const store = useMultiStepFormStore()
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
}
</script>

<template>
  <aside
    class="w-80 shrink-0 bg-white dark:bg-[#111118] border-s border-slate-200 dark:border-white/[0.07] flex flex-col"
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
