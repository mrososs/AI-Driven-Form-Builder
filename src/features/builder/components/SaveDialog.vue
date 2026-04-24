<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Save, Copy, Check, Code2 } from 'lucide-vue-next'
import AppDialog from '../../../components/shared/AppDialog.vue'
import { useFormStore } from '../../../stores/form'
import { useClipboard } from '../../../composables/useClipboard'
import type { Framework } from '../../../utils/codegen/shared'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const formStore = useFormStore()
const { copy, copied } = useClipboard()

const activeTab = ref<'ai-prompt' | 'save'>('ai-prompt')
const activeFramework = ref<Framework>('vue')
const isEditingPrompt = ref(false)
const editedPrompt = ref('')
const isSaving = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      activeTab.value = 'ai-prompt'
      activeFramework.value = 'vue'
      isEditingPrompt.value = false
      editedPrompt.value = ''
    }
  }
)

const frameworks: { id: Framework; label: string }[] = [
  { id: 'vue', label: 'vue' },
  { id: 'react', label: 'react' },
  { id: 'angular', label: 'angular' },
]

const generatedPrompt = computed(() => formStore.generatePrompt(activeFramework.value))
const displayPrompt = computed(() => (isEditingPrompt.value ? editedPrompt.value : generatedPrompt.value))

watch(activeFramework, () => {
  if (isEditingPrompt.value && editedPrompt.value) {
    return
  }
  editedPrompt.value = generatedPrompt.value
})

const isEmpty = computed(() => formStore.elements.length === 0)

function close() {
  emit('update:open', false)
}

function onCopyPrompt() {
  copy(displayPrompt.value)
}

function toggleEditPrompt() {
  if (!isEditingPrompt.value) {
    editedPrompt.value = generatedPrompt.value
  }
  isEditingPrompt.value = !isEditingPrompt.value
}

function resetPrompt() {
  editedPrompt.value = generatedPrompt.value
  isEditingPrompt.value = false
}

async function handleSaveForm() {
  isSaving.value = true
  try {
    await formStore.saveFormToFirestore()
  } finally {
    isSaving.value = false
  }
}

function tabClass(tab: 'ai-prompt' | 'save') {
  const base =
    'flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40'
  if (activeTab.value === tab) {
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
          <Save class="h-5 w-5" />
        </div>
        <div class="min-w-0 pt-0.5 flex-1">
          <h2 class="text-base sm:text-lg font-bold font-heading tracking-tight text-slate-900 dark:text-white">
            {{ t('builder.save.title') || 'Save Form & Generate Prompt' }}
          </h2>
          <p class="hidden sm:block text-sm text-slate-500 dark:text-white/50 mt-1 leading-relaxed">
            {{ t('builder.save.description') || 'Save your form and generate AI prompts for recreating it' }}
          </p>
        </div>
      </div>
    </template>

    <div v-if="isEmpty" class="rounded-lg border border-dashed border-slate-200 dark:border-white/10 p-6 text-center text-sm text-slate-500 dark:text-white/50">
      {{ t('builder.save.empty') || 'Add form fields before saving' }}
    </div>

    <div v-else class="space-y-4">
      <!-- Tab selector -->
      <div
        role="tablist"
        class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'ai-prompt'"
          :class="tabClass('ai-prompt')"
          @click="activeTab = 'ai-prompt'"
        >
          <Code2 class="h-4 w-4" />
          {{ t('builder.save.aiPromptTab') || 'AI Prompt' }}
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'save'"
          :class="tabClass('save')"
          @click="activeTab = 'save'"
        >
          <Save class="h-4 w-4" />
          {{ t('builder.save.saveTab') || 'Save' }}
        </button>
      </div>

      <!-- AI Prompt Tab -->
      <div v-show="activeTab === 'ai-prompt'" class="space-y-4">
        <!-- Framework selector -->
        <div
          role="group"
          :aria-label="t('builder.export.frameworkLabel') || 'Select framework'"
          class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]"
        >
          <button
            v-for="fw in frameworks"
            :key="fw.id"
            type="button"
            :aria-pressed="activeFramework === fw.id"
            :class="[
              'flex-1 inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40',
              activeFramework === fw.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
            ]"
            @click="activeFramework = fw.id"
          >
            {{ t(`builder.export.${fw.label}`) || fw.label }}
          </button>
        </div>

        <!-- Copy and Edit controls -->
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            @click="onCopyPrompt"
            class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg text-slate-700 dark:text-white/80 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            <component :is="copied ? Check : Copy" class="h-4 w-4" :class="{ 'text-emerald-500': copied }" />
            {{ copied ? (t('builder.export.copied') || 'Copied') : (t('builder.export.copy') || 'Copy Prompt') }}
          </button>

          <button
            type="button"
            @click="toggleEditPrompt"
            class="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            :class="isEditingPrompt
              ? 'text-slate-700 dark:text-white/80 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08]'
              : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'"
          >
            {{ isEditingPrompt ? (t('builder.save.done') || 'Done Editing') : (t('builder.save.edit') || 'Edit Prompt') }}
          </button>

          <button
            v-if="isEditingPrompt"
            type="button"
            @click="resetPrompt"
            class="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            {{ t('builder.save.reset') || 'Reset' }}
          </button>
        </div>

        <!-- Prompt display/edit -->
        <div v-if="isEditingPrompt" class="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0a0a0f] overflow-hidden">
          <textarea
            v-model="editedPrompt"
            class="w-full p-3 sm:p-4 text-xs sm:text-sm font-mono text-slate-800 dark:text-white/80 bg-white dark:bg-[#0a0a0f] border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none min-h-[50vh]"
            :aria-label="t('builder.save.promptEditor') || 'Edit AI prompt'"
          />
        </div>
        <div v-else class="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#0a0a0f] overflow-hidden">
          <pre class="code-pane m-0 p-3 sm:p-4 text-xs font-mono text-slate-800 dark:text-white/80 overflow-auto max-h-[50vh]"
            dir="ltr"
          ><code>{{ displayPrompt }}</code></pre>
        </div>
      </div>

      <!-- Save Tab -->
      <div v-show="activeTab === 'save'" class="space-y-4">
        <div class="p-4 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            {{ t('builder.save.formDetails') || 'Form Details' }}
          </h3>
          <div class="space-y-3">
            <div>
              <label for="save-title" class="block text-xs font-medium text-slate-600 dark:text-white/60 mb-1.5">
                {{ t('builder.save.titleLabel') || 'Title' }}
              </label>
              <input
                id="save-title"
                v-model="formStore.title"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.05] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div>
              <label for="save-description" class="block text-xs font-medium text-slate-600 dark:text-white/60 mb-1.5">
                {{ t('builder.save.descriptionLabel') || 'Description' }}
              </label>
              <textarea
                id="save-description"
                v-model="formStore.description"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.05] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="handleSaveForm"
          :disabled="isSaving"
          class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-[#111118]"
        >
          <Save class="h-4 w-4" />
          {{ isSaving ? (t('builder.save.saving') || 'Saving...') : (t('builder.save.saveButton') || 'Save Form') }}
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-end mt-6">
      <button
        type="button"
        @click="close"
        class="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold rounded-lg text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-white/30"
      >
        {{ t('builder.export.close') || 'Close' }}
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
