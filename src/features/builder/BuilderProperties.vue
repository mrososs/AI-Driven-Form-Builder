<script setup lang="ts">
import { computed } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useFormStore } from '../../stores/form'
import { Settings2, X, Trash2 } from 'lucide-vue-next'
import { getElementDefinition } from './elements'

const formStore = useFormStore()

const selectedElement = computed(() => formStore.selectedElement)

const definition = computed(() =>
  selectedElement.value ? getElementDefinition(selectedElement.value.type) : undefined
)

const showRequired = computed(() => selectedElement.value?.type !== 'row')
const showPlaceholder = computed(() => definition.value?.hasPlaceholder === true)
const showOptions = computed(() => definition.value?.hasOptions === true)

function closeProperties() {
  formStore.selectElement(null)
}

useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && selectedElement.value) closeProperties()
})

const label = computed({
  get: () => selectedElement.value?.label ?? '',
  set: (v) => {
    if (selectedElement.value) formStore.updateElement(selectedElement.value.id, { label: v })
  },
})

const required = computed({
  get: () => selectedElement.value?.required ?? false,
  set: (v) => {
    if (selectedElement.value) formStore.updateElement(selectedElement.value.id, { required: v })
  },
})

const placeholder = computed({
  get: () => selectedElement.value?.placeholder ?? '',
  set: (v) => {
    if (selectedElement.value) formStore.updateElement(selectedElement.value.id, { placeholder: v })
  },
})

function addOption() {
  if (selectedElement.value) formStore.addOption(selectedElement.value.id)
}

function removeOption(index: number) {
  if (selectedElement.value) formStore.removeOption(selectedElement.value.id, index)
}

function updateOptionAt(index: number, value: string) {
  if (selectedElement.value) formStore.updateOption(selectedElement.value.id, index, value)
}
</script>

<template>
  <aside
    v-show="selectedElement"
    class="w-80 bg-white dark:bg-[#111118] border-l border-slate-200 dark:border-white/[0.07] p-6 flex flex-col absolute inset-y-0 right-0 z-20 shadow-xl dark:shadow-black/50 lg:static lg:shadow-none transition-all duration-300"
  >
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-2">
        <Settings2 class="h-5 w-5 text-primary-600 dark:text-indigo-400" aria-hidden="true" />
        <h2 class="font-bold text-slate-800 dark:text-white text-base">Properties</h2>
      </div>
      <button @click="closeProperties" class="p-1.5 text-slate-500 dark:text-white/40 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07] rounded-lg">
        <X class="h-5 w-5" />
      </button>
    </div>

    <div v-if="selectedElement" class="flex-1 overflow-y-auto space-y-6">
      <div>
        <label class="block text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-2">Label</label>
        <input
          v-model="label"
          class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white bg-transparent dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
          placeholder="Field Label"
        />
      </div>

      <div v-if="showRequired">
        <label class="flex items-center gap-3 p-3 border border-slate-200 dark:border-white/[0.07] rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
          <input
            type="checkbox"
            v-model="required"
            class="h-4 w-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500 cursor-pointer"
          />
          <span class="text-sm font-medium text-slate-700 dark:text-white/70">Required field</span>
        </label>
      </div>

      <div v-if="showPlaceholder">
        <label class="block text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-2">Placeholder</label>
        <input
          v-model="placeholder"
          class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white bg-transparent dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
          placeholder="Hint text..."
        />
      </div>

      <div v-if="showOptions && selectedElement.options">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">Options</label>
        </div>
        <div class="space-y-2 mb-3">
          <div v-for="(option, idx) in selectedElement.options" :key="idx" class="flex items-center gap-2">
            <input
              :value="option"
              @input="updateOptionAt(idx, ($event.target as HTMLInputElement).value)"
              class="flex-1 flex-shrink min-w-0 border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-white bg-transparent dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
            />
            <button @click="removeOption(idx)" class="p-1.5 text-slate-500 dark:text-white/40 hover:text-red-500 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-lg shrink-0">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
        <button @click="addOption" class="w-full py-2 text-sm font-medium text-primary-600 dark:text-indigo-400 bg-primary-50 dark:bg-indigo-500/10 hover:bg-primary-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors">
          + Add Option
        </button>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center">
      <p class="text-xs text-slate-400 dark:text-white/25 text-center leading-relaxed font-medium">Select an element on the canvas<br />to edit its properties.</p>
    </div>
  </aside>
</template>
