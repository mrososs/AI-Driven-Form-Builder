<script setup lang="ts">
import { computed } from 'vue'
import { LayoutGrid, ListOrdered, Plus, Settings2 } from 'lucide-vue-next'
import { useMultiStepFormStore } from '../../../stores/multistepForm'
import { useMultiStepUI } from '../composables/useMultiStepUI'

const store = useMultiStepFormStore()
const { activePanel, setPanel } = useMultiStepUI()

const hasSteps = computed(() => store.steps.length > 0)
const hasSelection = computed(() => !!store.selectedElementId)

function tabClass(active: boolean, disabled = false) {
  if (disabled) return 'text-slate-300 dark:text-white/20 cursor-not-allowed'
  if (active) return 'text-indigo-600 dark:text-indigo-400'
  return 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
}
</script>

<template>
  <nav
    class="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/[0.07] pb-safe"
    aria-label="Multi-step builder panels"
  >
    <div class="flex items-stretch justify-around">
      <button
        type="button"
        @click="setPanel('steps')"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
          tabClass(activePanel === 'steps'),
        ]"
        aria-label="Open steps panel"
      >
        <ListOrdered class="h-5 w-5" />
        Steps
      </button>
      <button
        type="button"
        @click="setPanel('elements')"
        :disabled="!hasSteps"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
          tabClass(activePanel === 'elements', !hasSteps),
        ]"
        aria-label="Open elements panel"
      >
        <Plus class="h-5 w-5" />
        Elements
      </button>
      <button
        type="button"
        @click="setPanel('canvas')"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
          tabClass(activePanel === 'canvas'),
        ]"
        aria-label="Show canvas"
      >
        <LayoutGrid class="h-5 w-5" />
        Canvas
      </button>
      <button
        type="button"
        @click="setPanel('properties')"
        :disabled="!hasSelection"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
          tabClass(activePanel === 'properties', !hasSelection),
        ]"
        aria-label="Open properties panel"
      >
        <Settings2 class="h-5 w-5" />
        Properties
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
