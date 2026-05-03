<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Code2, Copy, Check, Download, Sparkles, AlignLeft } from 'lucide-vue-next'
import AppDialog from '../../../components/shared/AppDialog.vue'
import { useMultiStepFormStore } from '../../../stores/multistepForm'
import { useClipboard } from '../../../composables/useClipboard'
import {
  generateMultiStepCode,
  generateMultiStepPrompt,
  type MultiStepFramework,
} from '../utils/codegen'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const store = useMultiStepFormStore()
const { copy, copied } = useClipboard()

type ViewMode = 'code' | 'prompt'

const fw = ref<MultiStepFramework>('vue')
const view = ref<ViewMode>('code')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      fw.value = 'vue'
      view.value = 'code'
    }
  }
)

const generated = computed(() => generateMultiStepCode(fw.value, store.steps, store.rules))
const prompt = computed(() => generateMultiStepPrompt(fw.value, store.steps, store.rules))
const isEmpty = computed(() => store.steps.length === 0 || store.totalFields === 0)
const activeContent = computed(() =>
  view.value === 'prompt' ? prompt.value : generated.value.code
)

const frameworks: Array<{ id: MultiStepFramework; label: string }> = [
  { id: 'vue', label: 'Vue' },
  { id: 'react', label: 'React' },
  { id: 'angular', label: 'Angular' },
]

function close() {
  emit('update:open', false)
}

function onCopy() {
  copy(activeContent.value)
}

function onDownload() {
  const { code, filename } = generated.value
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function frameworkClass(id: MultiStepFramework) {
  const base =
    'flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 capitalize'
  return fw.value === id
    ? `${base} bg-indigo-600 text-white shadow-sm`
    : `${base} text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]`
}

function viewClass(mode: ViewMode) {
  const base =
    'flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40'
  return view.value === mode
    ? `${base} bg-white dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-sm`
    : `${base} text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white`
}
</script>

<template>
  <AppDialog
    :open="open"
    @update:open="emit('update:open', $event)"
    max-width="max-w-4xl"
    hide-footer
    hide-icon
  >
    <template #header>
      <div class="flex items-start gap-3 sm:gap-4 pe-10">
        <div
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl ring-1 bg-indigo-500/10 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0"
        >
          <Code2 class="h-5 w-5" />
        </div>
        <div class="min-w-0 pt-0.5 flex-1">
          <h2
            class="text-base sm:text-lg font-bold font-heading tracking-tight text-slate-900 dark:text-white"
          >
            Export multi-step form
          </h2>
          <p class="hidden sm:block text-sm text-slate-500 dark:text-white/50 mt-1 leading-relaxed">
            Copy a working multi-step component for Vue, React, or Angular — or grab an AI
            prompt that scaffolds the same flow in any LLM.
          </p>
        </div>
      </div>
    </template>

    <div
      v-if="isEmpty"
      class="rounded-lg border border-dashed border-slate-200 dark:border-white/10 p-6 text-center text-sm text-slate-500 dark:text-white/50"
    >
      Add at least one step with one field to export your form.
    </div>

    <div v-else class="space-y-4">
      <div
        role="tablist"
        aria-label="Framework"
        class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]"
      >
        <button
          v-for="f in frameworks"
          :key="f.id"
          type="button"
          role="tab"
          :aria-selected="fw === f.id"
          :class="frameworkClass(f.id)"
          @click="fw = f.id"
        >
          {{ f.label }}
        </button>
      </div>

      <div
        role="tablist"
        aria-label="View"
        class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="view === 'code'"
          :class="viewClass('code')"
          @click="view = 'code'"
        >
          <AlignLeft class="h-4 w-4" /> Code
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="view === 'prompt'"
          :class="viewClass('prompt')"
          @click="view = 'prompt'"
        >
          <Sparkles class="h-4 w-4" /> AI Prompt
        </button>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          v-if="view === 'code'"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] min-w-0 flex-1"
        >
          <span
            class="text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 shrink-0"
          >
            File
          </span>
          <code class="text-xs font-mono text-slate-800 dark:text-white/80 truncate">
            {{ generated.filename }}
          </code>
        </div>
        <p
          v-else
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/[0.08] border border-indigo-200/60 dark:border-indigo-400/20 text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 min-w-0 flex-1"
        >
          <Sparkles class="h-3.5 w-3.5 shrink-0" />
          <span class="truncate">
            Paste this into Claude, ChatGPT, or Cursor to scaffold the form.
          </span>
        </p>

        <div
          class="grid gap-2 sm:flex sm:items-center sm:gap-3 shrink-0"
          :class="view === 'code' ? 'grid-cols-2' : 'grid-cols-1'"
        >
          <button
            type="button"
            @click="onCopy"
            class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg text-slate-700 dark:text-white/80 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 sm:min-w-[96px]"
          >
            <component
              :is="copied ? Check : Copy"
              class="h-4 w-4"
              :class="{ 'text-emerald-500': copied }"
            />
            <span v-if="copied">Copied</span>
            <span v-else>{{ view === 'prompt' ? 'Copy prompt' : 'Copy' }}</span>
          </button>
          <button
            v-if="view === 'code'"
            type="button"
            @click="onDownload"
            class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-[#111118]"
          >
            <Download class="h-4 w-4" /> Download
          </button>
        </div>
      </div>

      <div
        class="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#0a0a0f] overflow-hidden"
      >
        <pre
          class="ms-code-pane m-0 p-3 sm:p-4 text-xs font-mono text-slate-800 dark:text-white/80 overflow-auto max-h-[40vh] sm:max-h-[50vh]"
          :class="{ 'whitespace-pre-wrap break-words': view === 'prompt' }"
          dir="ltr"
        ><code>{{ activeContent }}</code></pre>
      </div>
    </div>

    <div class="flex justify-end mt-6">
      <button
        type="button"
        @click="close"
        class="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold rounded-lg text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
      >
        Close
      </button>
    </div>
  </AppDialog>
</template>

<style scoped>
.ms-code-pane {
  tab-size: 2;
  white-space: pre;
}
</style>
