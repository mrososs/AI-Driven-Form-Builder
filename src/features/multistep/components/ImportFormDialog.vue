<script setup lang="ts">
import { computed, watch } from 'vue'
import { FolderInput, FileText, Calendar, Loader2 } from 'lucide-vue-next'
import AppDialog from '../../../components/shared/AppDialog.vue'
import { useFormStore, type SavedForm, type FormElement } from '../../../stores/form'
import { useMultiStepFormStore } from '../../../stores/multistepForm'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  imported: [stepId: string]
}>()

const formStore = useFormStore()
const multiStepStore = useMultiStepFormStore()

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      formStore.fetchUserForms()
    }
  }
)

const forms = computed<SavedForm[]>(() => formStore.userForms)
const isLoading = computed(() => formStore.isLoading)

function close() {
  emit('update:open', false)
}

function flattenedFieldCount(elements: FormElement[] | undefined): number {
  if (!elements) return 0
  let n = 0
  for (const el of elements) {
    if (el.type === 'row') n += el.children?.length ?? 0
    else n++
  }
  return n
}

function formatDate(timestamp: unknown): string {
  if (!timestamp) return ''
  const ts = timestamp as { toDate?: () => Date }
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(timestamp as string)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function pickForm(form: SavedForm) {
  const { stepId } = multiStepStore.importFormAsStep(form)
  emit('imported', stepId)
  close()
}
</script>

<template>
  <AppDialog
    :open="open"
    @update:open="emit('update:open', $event)"
    max-width="max-w-2xl"
    hide-footer
    hide-icon
  >
    <template #header>
      <div class="flex items-start gap-3 sm:gap-4 pe-10">
        <div
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl ring-1 bg-indigo-500/10 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0"
        >
          <FolderInput class="h-5 w-5" />
        </div>
        <div class="min-w-0 pt-0.5 flex-1">
          <h2 class="text-base sm:text-lg font-bold font-heading tracking-tight text-slate-900 dark:text-white">
            Import an existing form
          </h2>
          <p class="text-sm text-slate-500 dark:text-white/50 mt-1 leading-relaxed">
            Pick a saved form. Its fields will be added as a new step.
          </p>
        </div>
      </div>
    </template>

    <div class="-mx-1">
      <div
        v-if="isLoading && forms.length === 0"
        class="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-white/40"
      >
        <Loader2 class="h-4 w-4 animate-spin" />
        Loading your forms…
      </div>

      <div
        v-else-if="forms.length === 0"
        class="flex flex-col items-center justify-center gap-3 py-10 text-center"
      >
        <div class="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center">
          <FileText class="h-5 w-5 text-slate-400 dark:text-white/30" />
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-700 dark:text-white/80">
            No saved forms yet
          </p>
          <p class="text-xs text-slate-500 dark:text-white/40 mt-1 max-w-xs">
            Build and save a form in the single-page builder, then come back to import it here.
          </p>
        </div>
      </div>

      <ul v-else class="space-y-2 max-h-[55vh] overflow-y-auto pe-1">
        <li v-for="form in forms" :key="form.id">
          <button
            type="button"
            @click="pickForm(form)"
            class="group w-full text-start rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/[0.06] transition-colors p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 ring-1 ring-indigo-500/15"
              >
                <FileText class="h-4 w-4" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {{ form.title || 'Untitled form' }}
                </p>
                <p
                  v-if="form.description"
                  class="text-xs text-slate-500 dark:text-white/40 mt-0.5 line-clamp-2"
                >
                  {{ form.description }}
                </p>
                <div class="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-white/40">
                  <span class="inline-flex items-center gap-1">
                    <FileText class="h-3 w-3" />
                    {{ flattenedFieldCount(form.elements) }} fields
                  </span>
                  <span
                    v-if="form.updatedAt"
                    class="inline-flex items-center gap-1"
                  >
                    <Calendar class="h-3 w-3" />
                    {{ formatDate(form.updatedAt) }}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </AppDialog>
</template>
