<script setup lang="ts">
import { computed } from 'vue'
import { LayoutGrid, Plus, Settings2 } from 'lucide-vue-next'
import { useFormStore } from '../../stores/form'
import { useBuilderUI } from '../../composables/useBuilderUI'

const formStore = useFormStore()
const { activePanel, setPanel } = useBuilderUI()

const hasSelection = computed(() => !!formStore.selectedElementId)

function goCanvas() {
  setPanel('canvas')
}

function goElements() {
  setPanel('elements')
}

function goProperties() {
  if (!hasSelection.value) return
  setPanel('properties')
}
</script>

<template>
  <nav
    class="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/[0.07] pb-safe"
    aria-label="Builder panels"
  >
    <div class="flex items-stretch justify-around">
      <button
        type="button"
        @click="goElements"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
          activePanel === 'elements'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white',
        ]"
        aria-label="Open elements panel"
      >
        <Plus class="h-5 w-5" />
        Elements
      </button>
      <button
        type="button"
        @click="goCanvas"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
          activePanel === 'canvas'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white',
        ]"
        aria-label="Show canvas"
      >
        <LayoutGrid class="h-5 w-5" />
        Canvas
      </button>
      <button
        type="button"
        @click="goProperties"
        :disabled="!hasSelection"
        :class="[
          'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
          !hasSelection
            ? 'text-slate-300 dark:text-white/20 cursor-not-allowed'
            : activePanel === 'properties'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white',
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
