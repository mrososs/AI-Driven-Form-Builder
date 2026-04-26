<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, Save, Upload, Moon, Sun, ChevronLeft } from 'lucide-vue-next'
import { useMultiStepFormStore } from '../../../stores/multistepForm'
import { useTheme } from '../../../composables/useTheme'
import type { MultiStepMode } from './types'

const props = defineProps<{ mode: MultiStepMode }>()
const emit = defineEmits<{
  'update:mode': [mode: MultiStepMode]
  export: []
  save: []
}>()

const router = useRouter()
const store = useMultiStepFormStore()
const { isDark, toggleDark } = useTheme()

const stepCount = computed(() => store.steps.length)

const tabs: Array<{ key: MultiStepMode; label: string }> = [
  { key: 'build', label: 'Builder' },
  { key: 'preview', label: 'Preview' },
  { key: 'logic', label: 'Logic' },
]

function tabClass(key: MultiStepMode) {
  const base = 'px-2 sm:px-3 py-1.5 rounded-lg font-medium transition-all'
  return props.mode === key
    ? `${base} text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10`
    : `${base} text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07]`
}

function backToBuilder() {
  router.push({ name: 'builder' })
}
</script>

<template>
  <header
    class="h-14 shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 lg:px-6 bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07] z-40"
    style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
  >
    <div class="flex items-center gap-2 min-w-0 shrink-0">
      <button
        type="button"
        @click="backToBuilder"
        class="hidden md:flex items-center gap-1 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/[0.07] transition-colors"
        title="Back to builder"
        aria-label="Back to builder"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>
      <div
        class="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30 ring-1 ring-white/20"
      >
        <Sparkles class="h-3.5 w-3.5 text-white" />
      </div>
      <span class="hidden sm:inline font-bold text-base tracking-tight font-heading text-slate-900 dark:text-white">
        FormAI
      </span>
      <span
        class="ms-3 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold tracking-wide uppercase border border-indigo-200 dark:border-indigo-500/20 hidden md:inline"
      >
        Multi-step
      </span>
    </div>

    <nav class="flex items-center gap-1 text-sm" aria-label="Multi-step builder views">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :class="tabClass(tab.key)"
        @click="emit('update:mode', tab.key)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
      <div class="hidden lg:flex items-center gap-3 text-[11px] text-slate-500 dark:text-white/40 me-2">
        <span>
          <span class="text-slate-700 dark:text-white/70 font-semibold">{{ stepCount }}</span>
          steps
        </span>
        <span class="h-3 w-px bg-slate-200 dark:bg-white/10" />
        <span>
          <span class="text-slate-700 dark:text-white/70 font-semibold">{{ store.totalFields }}</span>
          fields
        </span>
      </div>
      <button
        type="button"
        @click="toggleDark()"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        class="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/[0.07] transition-colors"
      >
        <Sun v-if="isDark" class="h-4 w-4" />
        <Moon v-else class="h-4 w-4" />
      </button>
      <button
        type="button"
        @click="emit('export')"
        aria-label="Export"
        class="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-medium"
      >
        <Upload class="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        <span class="hidden sm:inline">Export</span>
      </button>
      <button
        type="button"
        @click="emit('save')"
        aria-label="Save"
        class="ms-builder-primary flex items-center gap-2 text-sm"
      >
        <Save class="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        <span class="hidden sm:inline">Save</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.ms-builder-primary {
  background-image: linear-gradient(to right, #4f46e5, #6366f1);
  color: white;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -10px rgba(99, 102, 241, 0.55);
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 640px) {
  .ms-builder-primary {
    padding: 0.5rem 1rem;
  }
}

.ms-builder-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -10px rgba(99, 102, 241, 0.7);
}
</style>
