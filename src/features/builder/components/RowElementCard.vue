<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { GripVertical, Settings2, Trash2, ChevronDown, Calendar, Clock, CalendarClock, Upload } from 'lucide-vue-next'
import type { FormElement } from '../../../stores/form'
import { useFormStore } from '../../../stores/form'

const TEXT_INPUT_TYPES = ['text', 'textarea', 'number', 'email', 'phone', 'url']
const DATE_TYPES = ['date', 'time', 'datetime']

function dateIcon(type: string) {
  if (type === 'time') return Clock
  if (type === 'datetime') return CalendarClock
  return Calendar
}

const props = defineProps<{ element: FormElement }>()

const formStore = useFormStore()

const rowLabel = computed({
  get: () => props.element.label,
  set: (value) => formStore.updateElement(props.element.id, { label: value }),
})

const rowChildren = computed({
  get: () => props.element.children ?? [],
  set: (next) => formStore.setRowChildren(props.element.id, next),
})

function updateChildLabel(id: string, value: string) {
  formStore.updateElement(id, { label: value })
}
</script>

<template>
  <div class="group relative bg-white dark:bg-[#111118] rounded-xl border border-slate-200 dark:border-white/[0.07] p-4 sm:p-6 hover:border-primary-300 dark:hover:border-indigo-500/40 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200">
    <div class="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 drag-handle cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/[0.07] rounded-md p-1 shadow-sm">
      <GripVertical class="h-4 w-4 text-slate-500 dark:text-white/40" aria-hidden="true" />
    </div>

    <div class="flex justify-between items-start mb-3 gap-2">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span class="md:hidden drag-handle cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 dark:text-white/30 shrink-0" aria-label="Drag handle">
          <GripVertical class="h-4 w-4" aria-hidden="true" />
        </span>
        <input
          v-model="rowLabel"
          class="font-semibold text-slate-800 dark:text-white w-full min-w-0 border-none focus:outline-none focus:ring-0 p-0 bg-transparent text-sm"
          aria-label="Label for row layout"
        />
      </div>
      <div class="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          @click.stop="formStore.selectElement(element.id)"
          class="p-1.5 text-slate-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-indigo-400 hover:bg-primary-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
          :class="{ 'text-primary-600 dark:text-indigo-400 bg-primary-50 dark:bg-indigo-500/10': formStore.selectedElementId === element.id }"
          aria-label="Row settings"
        >
          <Settings2 class="h-3.5 w-3.5" />
        </button>
        <button
          @click="formStore.removeElement(element.id)"
          class="p-1.5 text-slate-500 dark:text-white/40 hover:text-red-500 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
          :aria-label="`Remove ${element.label} row`"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <div class="mt-4 border border-dashed border-slate-300 dark:border-white/[0.08] rounded-xl p-4 bg-slate-50/50 dark:bg-white/[0.02]">
      <draggable
        v-model="rowChildren"
        item-key="id"
        group="canvas"
        handle=".drag-handle"
        :delay="150"
        :delay-on-touch-only="true"
        :touch-start-threshold="5"
        class="flex gap-4 min-h-[80px]"
        ghost-class="opacity-40"
      >
        <template #item="{ element: colElement }">
          <div class="flex-1 min-w-0 group/col relative bg-white dark:bg-[#16161e] rounded-lg border border-slate-200 dark:border-white/[0.07] p-3 sm:p-4 hover:border-primary-300 dark:hover:border-indigo-500/40 shadow-sm transition-all duration-200">
            <div class="hidden md:block absolute -left-2 top-1/2 -translate-y-1/2 drag-handle cursor-grab active:cursor-grabbing opacity-0 group-hover/col:opacity-100 transition-opacity bg-white dark:bg-[#16161e] border border-slate-200 dark:border-white/[0.07] rounded p-0.5 shadow-sm z-10">
              <GripVertical class="h-3 w-3 text-slate-500 dark:text-white/40" aria-hidden="true" />
            </div>

            <div class="flex justify-between items-start mb-2 gap-1">
              <div class="flex items-center gap-1 flex-1 min-w-0">
                <span class="md:hidden drag-handle cursor-grab active:cursor-grabbing p-0.5 -ml-0.5 text-slate-400 dark:text-white/30 shrink-0" aria-label="Drag handle">
                  <GripVertical class="h-3 w-3" aria-hidden="true" />
                </span>
                <input
                  :value="colElement.label"
                  @input="updateChildLabel(colElement.id, ($event.target as HTMLInputElement).value)"
                  class="font-semibold text-slate-800 dark:text-white w-full min-w-0 border-none focus:outline-none focus:ring-0 p-0 bg-transparent text-sm"
                  :aria-label="`Label for ${colElement.type} field`"
                />
              </div>
              <div class="flex items-center gap-0.5 shrink-0 opacity-100 md:opacity-0 md:group-hover/col:opacity-100 transition-opacity">
                <button
                  @click.stop="formStore.selectElement(colElement.id)"
                  class="p-1 text-slate-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-indigo-400 rounded"
                  :class="{ 'text-primary-600 dark:text-indigo-400': formStore.selectedElementId === colElement.id }"
                >
                  <Settings2 class="h-3 w-3" />
                </button>
                <button @click.stop="formStore.removeElement(colElement.id)" class="p-1 text-slate-500 dark:text-white/40 hover:text-red-500 dark:hover:text-rose-400 rounded">
                  <Trash2 class="h-3 w-3" />
                </button>
              </div>
            </div>

            <div class="mt-1">
              <div v-if="TEXT_INPUT_TYPES.includes(colElement.type)" class="border border-slate-200 dark:border-white/[0.07] rounded bg-slate-50 dark:bg-white/[0.04] px-2 py-1.5 text-xs text-slate-500 dark:text-white/30 truncate">
                {{ colElement.placeholder || 'User input...' }}
              </div>
              <div v-else-if="colElement.type === 'select'" class="border border-slate-200 dark:border-white/[0.07] rounded bg-slate-50 dark:bg-white/[0.04] px-2 py-1.5 flex justify-between items-center">
                <span class="text-xs text-slate-500 dark:text-white/30">Select option</span>
                <ChevronDown class="h-3 w-3 text-slate-500 dark:text-white/30" />
              </div>
              <div v-else-if="colElement.type === 'radio'" class="space-y-1">
                <div
                  v-for="opt in (colElement.options ?? []).slice(0, 2)"
                  :key="opt"
                  class="flex items-center gap-2"
                >
                  <div class="h-3 w-3 rounded-full border border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.05] shrink-0"></div>
                  <span class="text-xs text-slate-500 dark:text-white/30 truncate">{{ opt }}</span>
                </div>
              </div>
              <div v-else-if="colElement.type === 'checkbox'" class="flex items-center gap-2">
                <div class="h-3 w-3 border border-slate-300 dark:border-white/20 rounded bg-white dark:bg-white/[0.05] shrink-0"></div>
                <span class="text-xs text-slate-500 dark:text-white/30">Option</span>
              </div>
              <div v-else-if="DATE_TYPES.includes(colElement.type)" class="border border-slate-200 dark:border-white/[0.07] rounded bg-slate-50 dark:bg-white/[0.04] px-2 py-1.5 flex justify-between items-center">
                <span class="text-xs text-slate-500 dark:text-white/30">
                  {{ colElement.type === 'time' ? 'HH:MM' : colElement.type === 'datetime' ? 'YYYY-MM-DD HH:MM' : 'YYYY-MM-DD' }}
                </span>
                <component :is="dateIcon(colElement.type)" class="h-3 w-3 text-slate-500 dark:text-white/30" />
              </div>
              <div v-else-if="colElement.type === 'file'" class="border border-dashed border-slate-300 dark:border-white/[0.12] rounded bg-slate-50 dark:bg-white/[0.04] px-2 py-1.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-white/30">
                <Upload class="h-3 w-3" />
                <span>Upload</span>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div v-if="rowChildren.length === 0" class="flex-1 flex items-center justify-center text-xs text-slate-500 dark:text-white/30 font-medium h-full italic">
            Drag elements here to build columns
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
