<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue'
import {
  Plus,
  Settings2,
  ArrowUpDown,
  Copy,
  Eraser,
  Trash2,
  Shield,
  FolderInput,
  X,
} from 'lucide-vue-next'
import { useMultiStepFormStore } from '../../../stores/multistepForm'
import { STEP_ICONS } from '../utils/icons'
import type { FormStep } from '../../../stores/multistepForm'
import ImportFormDialog from './ImportFormDialog.vue'
import { useMultiStepUI } from '../composables/useMultiStepUI'

const store = useMultiStepFormStore()
const { isStepsOpen, isMobile, closeSheets } = useMultiStepUI()
const hover = ref<string | null>(null)
const renaming = ref<string | null>(null)
const inputRef = useTemplateRef<HTMLInputElement>('renameInput')
const isImportOpen = ref(false)

function selectStepAndCloseOnMobile(id: string) {
  store.selectStep(id)
  if (isMobile.value) closeSheets()
}

async function startRename(id: string) {
  renaming.value = id
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

function commitRename(step: FormStep, value: string) {
  store.updateStep(step.id, { title: value.trim() || step.title })
  renaming.value = null
}

function onRenameKey(step: FormStep, e: KeyboardEvent) {
  if (e.key === 'Enter') {
    commitRename(step, (e.target as HTMLInputElement).value)
  } else if (e.key === 'Escape') {
    renaming.value = null
  }
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
      v-if="isStepsOpen"
      @click="closeSheets"
      class="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-30 lg:hidden"
      aria-hidden="true"
    />
  </Transition>

  <aside
    :class="[
      'bg-slate-50 dark:bg-[#0c0c12] flex flex-col',
      'lg:static lg:w-56 xl:w-64 lg:shrink-0 lg:translate-y-0 lg:border-e lg:border-slate-200 lg:dark:border-white/[0.06] lg:rounded-none lg:shadow-none lg:max-h-none lg:transition-none',
      'fixed inset-x-0 bottom-[52px] z-40 max-h-[70vh] rounded-t-2xl border-t border-slate-200 dark:border-white/[0.07] shadow-2xl shadow-black/20 dark:shadow-black/60 transition-transform duration-300 ease-out',
      isStepsOpen ? 'translate-y-0' : 'translate-y-[calc(100%+52px)] lg:translate-y-0',
    ]"
    aria-label="Form steps"
  >
    <div class="p-4 pb-3 border-b border-slate-200 dark:border-white/[0.05] flex items-center justify-between gap-2">
      <div class="min-w-0">
        <h2 class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em]">
          Steps
        </h2>
        <p class="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">
          {{ store.steps.length === 0 ? 'No steps yet' : 'Tap to switch steps' }}
        </p>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button
          type="button"
          @click="isImportOpen = true"
          title="Import from existing form"
          aria-label="Import from existing form"
          class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-white/60 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/10 transition-colors"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <FolderInput class="h-4 w-4" />
        </button>
        <button
          type="button"
          @click="store.addStep()"
          title="Add step"
          aria-label="Add step"
          class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-white/60 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/10 transition-colors"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <Plus class="h-4 w-4" />
        </button>
        <button
          type="button"
          @click="closeSheets"
          class="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/[0.07] transition-colors"
          aria-label="Close steps panel"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1.5">
      <div
        v-for="(step, i) in store.steps"
        :key="step.id"
        @mouseenter="hover = step.id"
        @mouseleave="hover = null"
        :class="[
          'group relative rounded-xl transition-all duration-200',
          step.id === store.activeStepId
            ? 'bg-gradient-to-br from-indigo-500/15 to-violet-500/10 border border-indigo-400 dark:border-indigo-500/40 shadow-lg shadow-indigo-500/10'
            : 'border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/[0.03]',
        ]"
        style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
      >
        <button
          type="button"
          @click="selectStepAndCloseOnMobile(step.id)"
          class="w-full flex items-start gap-3 p-3 text-start"
        >
          <div class="flex flex-col items-center gap-1 shrink-0">
            <div
              :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold font-heading transition-all',
                step.id === store.activeStepId
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/40 ring-1 ring-white/20'
                  : 'bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-white/[0.05] dark:text-white/60 dark:ring-white/[0.06]',
              ]"
              style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
            >
              <component :is="STEP_ICONS[step.icon]" class="h-3.5 w-3.5" />
            </div>
            <span
              :class="[
                'text-[10px] font-semibold tabular-nums',
                step.id === store.activeStepId
                  ? 'text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-400 dark:text-white/40',
              ]"
            >
              {{ String(i + 1).padStart(2, '0') }}
            </span>
          </div>
          <div class="min-w-0 flex-1 pt-0.5">
            <input
              v-if="renaming === step.id"
              ref="renameInput"
              :defaultValue="step.title"
              @click.stop
              @blur="commitRename(step, ($event.target as HTMLInputElement).value)"
              @keydown="onRenameKey(step, $event)"
              class="w-full bg-transparent border-b border-indigo-400/60 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
            <p
              v-else
              :class="[
                'text-sm font-semibold leading-tight truncate',
                step.id === store.activeStepId
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-700 dark:text-white/80',
              ]"
            >
              {{ step.title }}
            </p>
            <p class="text-[11px] text-slate-400 dark:text-white/40 mt-0.5 truncate">
              {{ step.elements.length }}
              {{ step.elements.length === 1 ? 'field' : 'fields' }}
            </p>
          </div>
        </button>

        <div
          :class="[
            'absolute end-2 top-2 flex items-center gap-0.5 transition-opacity opacity-100',
            hover === step.id ? 'lg:opacity-100' : 'lg:opacity-0',
          ]"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <button
            type="button"
            @click.stop="startRename(step.id)"
            title="Rename"
            class="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10"
          >
            <Settings2 class="h-3 w-3" />
          </button>
          <button
            type="button"
            @click.stop="store.moveStep(step.id, -1)"
            title="Move up"
            class="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10"
          >
            <ArrowUpDown class="h-3 w-3" />
          </button>
          <button
            type="button"
            @click.stop="store.duplicateStep(step.id)"
            title="Duplicate"
            class="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10"
          >
            <Copy class="h-3 w-3" />
          </button>
          <button
            type="button"
            @click.stop="store.clearStepElements(step.id)"
            title="Clear fields"
            :disabled="step.elements.length === 0"
            class="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:text-white/40 dark:hover:text-amber-400 dark:hover:bg-amber-500/10 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Eraser class="h-3 w-3" />
          </button>
          <button
            type="button"
            @click.stop="store.removeStep(step.id)"
            title="Delete"
            class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-white/40 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <Trash2 class="h-3 w-3" />
          </button>
        </div>

        <div
          v-if="i < store.steps.length - 1"
          class="absolute start-[26px] -bottom-1.5 w-px h-1.5 bg-slate-200 dark:bg-white/10"
        />
      </div>

      <button
        type="button"
        @click="store.addStep()"
        class="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 dark:border-white/[0.12] dark:text-white/40 dark:hover:text-indigo-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/[0.06] transition-all text-sm font-medium"
        style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
      >
        <Plus class="h-3.5 w-3.5" /> Add step
      </button>
    </div>

    <div class="hidden lg:block p-3 border-t border-slate-200 dark:border-white/[0.05]">
      <div
        class="rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-3"
      >
        <div
          class="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider mb-1.5"
        >
          <Shield class="h-3 w-3" /> Flow
        </div>
        <p class="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed">
          {{ store.flow.linear ? 'Linear' : 'Free' }} •
          {{ store.flow.requireAll ? 'required step gating on' : 'gating off' }}
          • progress saved per tenant.
        </p>
      </div>
    </div>

    <ImportFormDialog v-model:open="isImportOpen" />
  </aside>
</template>
