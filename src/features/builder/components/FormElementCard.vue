<script setup lang="ts">
import { computed } from 'vue'
import { GripVertical, Settings2, Trash2, ChevronDown } from 'lucide-vue-next'
import type { FormElement } from '../../../stores/form'
import { useFormStore } from '../../../stores/form'

const props = defineProps<{ element: FormElement }>()

const formStore = useFormStore()

const label = computed({
  get: () => props.element.label,
  set: (value) => formStore.updateElement(props.element.id, { label: value }),
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
        v-if="element.type === 'text' || element.type === 'textarea'"
        class="border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-white/30 text-sm"
      >
        {{ element.placeholder || 'User input goes here...' }}
      </div>
      <div
        v-else-if="element.type === 'select'"
        class="border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] flex justify-between items-center"
      >
        <span class="text-slate-500 dark:text-white/30 text-sm">Select an option</span>
        <ChevronDown class="h-4 w-4 text-slate-500 dark:text-white/30" aria-hidden="true" />
      </div>
      <div v-else-if="element.type === 'checkbox'" class="flex items-center gap-3">
        <div class="h-4 w-4 border-2 border-slate-300 dark:border-white/20 rounded bg-white dark:bg-white/[0.05] shrink-0"></div>
        <span class="text-slate-500 dark:text-white/30 text-sm">Checkbox option</span>
      </div>
    </div>
  </div>
</template>
