<script setup lang="ts">
import { computed } from 'vue'
import {
  GripVertical,
  Settings2,
  Trash2,
  ChevronDown,
  Calendar,
  Clock,
  CalendarClock,
  Upload,
} from 'lucide-vue-next'
import type { FormElement } from '../../../stores/form'
import { useFormStore } from '../../../stores/form'

const props = defineProps<{ element: FormElement }>()

const formStore = useFormStore()

const label = computed({
  get: () => props.element.label,
  set: (value) => formStore.updateElement(props.element.id, { label: value }),
})

const TEXT_INPUT_TYPES = ['text', 'textarea', 'number', 'email', 'phone', 'url']

const isTextInput = computed(() => TEXT_INPUT_TYPES.includes(props.element.type))

const placeholderFallback = computed(() => {
  switch (props.element.type) {
    case 'number': return '0'
    case 'email': return 'you@example.com'
    case 'phone': return '+1 (555) 123-4567'
    case 'url': return 'https://example.com'
    default: return 'User input goes here...'
  }
})

const dateTimeIcon = computed(() => {
  if (props.element.type === 'time') return Clock
  if (props.element.type === 'datetime') return CalendarClock
  return Calendar
})

const dateTimePlaceholder = computed(() => {
  if (props.element.type === 'time') return 'HH:MM'
  if (props.element.type === 'datetime') return 'YYYY-MM-DD HH:MM'
  return 'YYYY-MM-DD'
})
</script>

<template>
  <div class="group relative bg-white dark:bg-[#111118] rounded-xl border border-slate-200 dark:border-white/[0.07] p-6 hover:border-primary-300 dark:hover:border-indigo-500/40 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200">
    <div class="absolute -left-3 top-1/2 -translate-y-1/2 drag-handle cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/[0.07] rounded-md p-1 shadow-sm">
      <GripVertical class="h-4 w-4 text-slate-500 dark:text-white/40" aria-hidden="true" />
    </div>

    <div class="flex justify-between items-start mb-3">
      <div class="flex-1 mr-4">
        <input
          v-model="label"
          class="font-semibold text-slate-800 dark:text-white w-full border-none focus:outline-none focus:ring-0 p-0 bg-transparent text-sm"
          :aria-label="`Label for ${element.type} field`"
        />
      </div>
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          @click.stop="formStore.selectElement(element.id)"
          class="p-1.5 text-slate-500 dark:text-white/40 hover:text-primary-600 dark:hover:text-indigo-400 hover:bg-primary-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
          :class="{ 'text-primary-600 dark:text-indigo-400 bg-primary-50 dark:bg-indigo-500/10': formStore.selectedElementId === element.id }"
          aria-label="Field settings"
        >
          <Settings2 class="h-3.5 w-3.5" />
        </button>
        <button
          @click="formStore.removeElement(element.id)"
          class="p-1.5 text-slate-500 dark:text-white/40 hover:text-red-500 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
          :aria-label="`Remove ${element.label} field`"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <div class="mt-1">
      <div
        v-if="isTextInput"
        class="border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-white/30 text-sm"
      >
        {{ element.placeholder || placeholderFallback }}
      </div>
      <div
        v-else-if="element.type === 'select'"
        class="border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] flex justify-between items-center"
      >
        <span class="text-slate-500 dark:text-white/30 text-sm">Select an option</span>
        <ChevronDown class="h-4 w-4 text-slate-500 dark:text-white/30" aria-hidden="true" />
      </div>
      <div v-else-if="element.type === 'radio'" class="space-y-2">
        <div
          v-for="opt in (element.options ?? [])"
          :key="opt"
          class="flex items-center gap-3"
        >
          <div class="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.05] shrink-0"></div>
          <span class="text-slate-500 dark:text-white/30 text-sm">{{ opt }}</span>
        </div>
      </div>
      <div v-else-if="element.type === 'checkbox'" class="flex items-center gap-3">
        <div class="h-4 w-4 border-2 border-slate-300 dark:border-white/20 rounded bg-white dark:bg-white/[0.05] shrink-0"></div>
        <span class="text-slate-500 dark:text-white/30 text-sm">Checkbox option</span>
      </div>
      <div
        v-else-if="element.type === 'date' || element.type === 'time' || element.type === 'datetime'"
        class="border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] flex justify-between items-center"
      >
        <span class="text-slate-500 dark:text-white/30 text-sm">{{ dateTimePlaceholder }}</span>
        <component :is="dateTimeIcon" class="h-4 w-4 text-slate-500 dark:text-white/30" aria-hidden="true" />
      </div>
      <div
        v-else-if="element.type === 'file'"
        class="border border-dashed border-slate-300 dark:border-white/[0.12] rounded-lg px-3 py-4 bg-slate-50 dark:bg-white/[0.04] flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-white/30"
      >
        <Upload class="h-4 w-4" aria-hidden="true" />
        <span>Click to upload a file</span>
      </div>
    </div>
  </div>
</template>
