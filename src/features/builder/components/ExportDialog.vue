<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Code2, Copy, Check, Download } from 'lucide-vue-next'
import AppDialog from '../../../components/shared/AppDialog.vue'
import { useFormStore } from '../../../stores/form'
import { useClipboard } from '../../../composables/useClipboard'
import { generateComponent, type Framework } from '../../../utils/codegen'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const formStore = useFormStore()
const { copy, copied } = useClipboard()

const activeFramework = ref<Framework>('vue')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) activeFramework.value = 'vue'
  }
)

const frameworks: { id: Framework; label: string }[] = [
  { id: 'vue', label: 'vue' },
  { id: 'react', label: 'react' },
  { id: 'angular', label: 'angular' },
]

const generated = computed(() =>
  generateComponent(formStore.elements, formStore.title, activeFramework.value)
)

const isEmpty = computed(() => formStore.elements.length === 0)

function close() {
  emit('update:open', false)
}

function onCopy() {
  copy(generated.value.code)
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

function tabClass(framework: Framework) {
  const base =
    'flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40'
  if (activeFramework.value === framework) {
    return `${base} bg-indigo-600 text-white shadow-sm`
  }
  return `${base} text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]`
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
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl ring-1 bg-indigo-500/10 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Code2 class="h-5 w-5" />
        </div>
        <div class="min-w-0 pt-0.5 flex-1">
          <h2 class="text-base sm:text-lg font-bold font-heading tracking-tight text-slate-900 dark:text-white">
            {{ t('builder.export.title') }}
          </h2>
          <p class="hidden sm:block text-sm text-slate-500 dark:text-white/50 mt-1 leading-relaxed">
            {{ t('builder.export.description') }}
          </p>
        </div>
      </div>
    </template>

    <div v-if="isEmpty" class="rounded-lg border border-dashed border-slate-200 dark:border-white/10 p-6 text-center text-sm text-slate-500 dark:text-white/50">
      {{ t('builder.export.empty') }}
    </div>

    <div v-else class="space-y-4">
      <div
        role="tablist"
        :aria-label="t('builder.export.frameworkLabel')"
        class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]"
      >
        <button
          v-for="fw in frameworks"
          :key="fw.id"
          type="button"
          role="tab"
          :aria-selected="activeFramework === fw.id"
          :class="tabClass(fw.id)"
          @click="activeFramework = fw.id"
        >
          {{ t(`builder.export.${fw.label}`) }}
        </button>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] min-w-0 flex-1">
          <span class="text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 shrink-0">
            {{ t('builder.export.filenameLabel') }}
          </span>
          <code class="text-xs font-mono text-slate-800 dark:text-white/80 truncate">
            {{ generated.filename }}
          </code>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 shrink-0">
          <button
            type="button"
            @click="onCopy"
            class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg text-slate-700 dark:text-white/80 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 sm:min-w-[96px]"
          >
            <component :is="copied ? Check : Copy" class="h-4 w-4" :class="{ 'text-emerald-500': copied }" />
            {{ copied ? t('builder.export.copied') : t('builder.export.copy') }}
          </button>
          <button
            type="button"
            @click="onDownload"
            class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-[#111118]"
          >
            <Download class="h-4 w-4" />
            {{ t('builder.export.download') }}
          </button>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#0a0a0f] overflow-hidden">
        <pre class="code-pane m-0 p-3 sm:p-4 text-xs font-mono text-slate-800 dark:text-white/80 overflow-auto max-h-[40vh] sm:max-h-[50vh]"
          dir="ltr"
        ><code>{{ generated.code }}</code></pre>
      </div>
    </div>

    <div class="flex justify-end mt-6">
      <button
        type="button"
        @click="close"
        class="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold rounded-lg text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-white/30"
      >
        {{ t('builder.export.close') }}
      </button>
    </div>
  </AppDialog>
</template>

<style scoped>
.code-pane {
  tab-size: 2;
  white-space: pre;
}
</style>
