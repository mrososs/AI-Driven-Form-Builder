<script setup lang="ts">
import draggable from 'vuedraggable'
import { GripVertical, Settings2, Trash2, ChevronDown } from 'lucide-vue-next'
import type { FormElement } from '../../../stores/form'
import { useFormStore } from '../../../stores/form'

defineProps<{ element: FormElement }>()

const formStore = useFormStore()
</script>

<template>
  <div class="group relative bg-white dark:bg-[#111118] rounded-xl border border-slate-200 dark:border-white/[0.07] p-6 hover:border-primary-300 dark:hover:border-indigo-500/40 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200">
    <div class="absolute -left-3 top-1/2 -translate-y-1/2 drag-handle cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/[0.07] rounded-md p-1 shadow-sm">
      <GripVertical class="h-4 w-4 text-slate-500 dark:text-white/40" aria-hidden="true" />
    </div>

    <div class="flex justify-between items-start mb-3">
      <div class="flex-1 mr-4">
        <input
          v-model="element.label"
          class="font-semibold text-slate-800 dark:text-white w-full border-none focus:outline-none focus:ring-0 p-0 bg-transparent text-sm"
          aria-label="Label for row layout"
        />
      </div>
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        v-model="element.children"
        item-key="id"
        group="canvas"
        handle=".drag-handle"
        class="flex gap-4 min-h-[80px]"
        ghost-class="opacity-40"
      >
        <template #item="{ element: colElement }">
          <div class="flex-1 group/col relative bg-white dark:bg-[#16161e] rounded-lg border border-slate-200 dark:border-white/[0.07] p-4 hover:border-primary-300 dark:hover:border-indigo-500/40 shadow-sm transition-all duration-200">
            <div class="absolute -left-2 top-1/2 -translate-y-1/2 drag-handle cursor-grab active:cursor-grabbing opacity-0 group-hover/col:opacity-100 transition-opacity bg-white dark:bg-[#16161e] border border-slate-200 dark:border-white/[0.07] rounded p-0.5 shadow-sm z-10">
              <GripVertical class="h-3 w-3 text-slate-500 dark:text-white/40" aria-hidden="true" />
            </div>

            <div class="flex justify-between items-start mb-2">
              <input
                v-model="colElement.label"
                class="font-semibold text-slate-800 dark:text-white w-full border-none focus:outline-none focus:ring-0 p-0 bg-transparent text-sm flex-1 mr-2"
                :aria-label="`Label for ${colElement.type} field`"
              />
              <div class="flex items-center gap-0.5 opacity-0 group-hover/col:opacity-100 transition-opacity">
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
              <div v-if="colElement.type === 'text' || colElement.type === 'textarea'" class="border border-slate-200 dark:border-white/[0.07] rounded bg-slate-50 dark:bg-white/[0.04] px-2 py-1.5 text-xs text-slate-500 dark:text-white/30">
                {{ colElement.placeholder || 'User input...' }}
              </div>
              <div v-else-if="colElement.type === 'select'" class="border border-slate-200 dark:border-white/[0.07] rounded bg-slate-50 dark:bg-white/[0.04] px-2 py-1.5 flex justify-between items-center">
                <span class="text-xs text-slate-500 dark:text-white/30">Select option</span>
                <ChevronDown class="h-3 w-3 text-slate-500 dark:text-white/30" />
              </div>
              <div v-else-if="colElement.type === 'checkbox'" class="flex items-center gap-2">
                <div class="h-3 w-3 border border-slate-300 dark:border-white/20 rounded bg-white dark:bg-white/[0.05] shrink-0"></div>
                <span class="text-xs text-slate-500 dark:text-white/30">Option</span>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div v-if="!element.children || element.children.length === 0" class="flex-1 flex items-center justify-center text-xs text-slate-500 dark:text-white/30 font-medium h-full italic">
            Drag elements here to build columns
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
