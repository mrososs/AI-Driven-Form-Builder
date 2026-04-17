<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import type { FormElement } from '../../stores/form'
import {
  Type,
  CheckSquare,
  ChevronDown,
  LayoutList,
  Wand2
} from 'lucide-vue-next'

const availableElements = ref([
  { type: 'text',     label: 'Short Text', icon: Type },
  { type: 'textarea', label: 'Long Text',  icon: Type },
  { type: 'select',   label: 'Dropdown',   icon: ChevronDown },
  { type: 'checkbox', label: 'Checkbox',   icon: CheckSquare },
  { type: 'row',      label: 'Layout Row', icon: LayoutList },
])

function cloneElement(original: any): FormElement {
  return {
    id: Math.random().toString(36).slice(2, 11),
    type: original.type,
    label: `New ${original.type === 'row' ? 'Row' : original.label}`,
    required: false,
    placeholder: original.type === 'text' || original.type === 'textarea' ? 'Enter text...' : undefined,
    children: original.type === 'row' ? [] : undefined,
    options: original.type === 'select' ? ['Option 1'] : undefined
  }
}
</script>

<template>
  <aside class="w-72 bg-white dark:bg-[#111118] border-r border-slate-200 dark:border-white/[0.07] flex flex-col">
    <div class="p-6 border-b border-slate-100 dark:border-white/[0.05]">
      <h2 class="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">Elements</h2>
    </div>
    <div class="p-4 space-y-2 overflow-y-auto flex-1">
      <draggable
        v-model="availableElements"
        item-key="type"
        :group="{ name: 'canvas', pull: 'clone', put: false }"
        :clone="cloneElement"
        :sort="false"
        class="space-y-2"
      >
        <template #item="{ element }">
          <div
            class="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/[0.07] hover:border-primary-400 dark:hover:border-indigo-500/50 hover:bg-primary-50 dark:hover:bg-indigo-500/10 transition-all group text-left cursor-grab active:cursor-grabbing"
            :aria-label="`Drag ${element.label} field`"
          >
            <div class="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.06] group-hover:bg-primary-100 dark:group-hover:bg-indigo-500/20 text-slate-500 dark:text-white/50 group-hover:text-primary-600 dark:group-hover:text-indigo-400 transition-colors">
              <component :is="element.icon" class="h-4 w-4" />
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-white/80 group-hover:text-primary-700 dark:group-hover:text-indigo-300">{{ element.label }}</span>
          </div>
        </template>
      </draggable>

      <div class="pt-6">
        <button class="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-200">
          <Wand2 class="h-4 w-4" />
          AI Suggest Elements
        </button>
      </div>
    </div>
  </aside>
</template>
