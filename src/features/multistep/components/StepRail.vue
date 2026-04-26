<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue'
import {
  Plus,
  Settings2,
  ArrowUpDown,
  Copy,
  Trash2,
  Shield,
} from 'lucide-vue-next'
import { useMultiStepFormStore } from '../../../stores/multistepForm'
import { STEP_ICONS } from '../utils/icons'
import type { FormStep } from '../../../stores/multistepForm'

const store = useMultiStepFormStore()
const hover = ref<string | null>(null)
const renaming = ref<string | null>(null)
const inputRef = useTemplateRef<HTMLInputElement>('renameInput')

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
  <aside
    class="w-64 shrink-0 bg-slate-50 dark:bg-[#0c0c12] border-e border-slate-200 dark:border-white/[0.06] flex flex-col"
    aria-label="Form steps"
  >
    <div class="p-4 pb-3 border-b border-slate-200 dark:border-white/[0.05] flex items-center justify-between">
      <div>
        <h2 class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em]">
          Steps
        </h2>
        <p class="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">
          {{ store.steps.length === 0 ? 'No steps yet' : 'Click to switch steps' }}
        </p>
      </div>
      <button
        type="button"
        @click="store.addStep()"
        title="Add step"
        class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-white/60 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/10 transition-colors"
        style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
      >
        <Plus class="h-4 w-4" />
      </button>
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
          @click="store.selectStep(step.id)"
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
            'absolute end-2 top-2 flex items-center gap-0.5 transition-opacity',
            hover === step.id ? 'opacity-100' : 'opacity-0',
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

    <div class="p-3 border-t border-slate-200 dark:border-white/[0.05]">
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
  </aside>
</template>
