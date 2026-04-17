<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useFormStore } from '../../stores/form'
import { Settings2, X, Trash2 } from 'lucide-vue-next'

const formStore = useFormStore()

const selectedElement = computed(() => formStore.selectedElement)

function closeProperties() {
  formStore.selectElement(null)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && selectedElement.value) {
    closeProperties()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
} )

function addOption() {
  if (selectedElement.value && selectedElement.value.options) {
    selectedElement.value.options.push(`Option ${selectedElement.value.options.length + 1}`)
  }
}

function removeOption(index: number) {
  if (selectedElement.value && selectedElement.value.options) {
    selectedElement.value.options.splice(index, 1)
  }
}
</script>

<template>
  <aside 
    v-show="selectedElement"
    class="w-80 bg-white border-l border-slate-200 p-6 flex flex-col absolute inset-y-0 right-0 z-20 shadow-xl lg:static lg:shadow-none transition-all duration-300" 
  >
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-2">
        <Settings2 class="h-5 w-5 text-primary-600" aria-hidden="true" />
        <h2 class="font-bold text-slate-800 text-base">Properties</h2>
      </div>
      <button @click="closeProperties" class="p-1.5 text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
        <X class="h-5 w-5" />
      </button>
    </div>

    <div v-if="selectedElement" class="flex-1 overflow-y-auto space-y-6">
      <div>
        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Label</label>
        <input
          v-model="selectedElement.label"
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          placeholder="Field Label"
        />
      </div>

      <div v-if="selectedElement.type !== 'row'">
        <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            v-model="selectedElement.required"
            class="h-4 w-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500 cursor-pointer"
          />
          <span class="text-sm font-medium text-slate-700">Required field</span>
        </label>
      </div>

      <div v-if="selectedElement.type === 'text' || selectedElement.type === 'textarea'">
        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Placeholder</label>
        <input
          v-model="selectedElement.placeholder"
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          placeholder="Hint text..."
        />
      </div>

      <div v-if="selectedElement.type === 'select' && selectedElement.options">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Options</label>
        </div>
        <div class="space-y-2 mb-3">
          <div v-for="(_, idx) in selectedElement.options" :key="idx" class="flex items-center gap-2">
            <input
              v-model="selectedElement.options[idx]"
              class="flex-1 flex-shrink min-w-0 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            <button @click="removeOption(idx)" class="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
        <button @click="addOption" class="w-full py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
          + Add Option
        </button>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center">
      <p class="text-xs text-slate-400 text-center leading-relaxed font-medium">Select an element on the canvas<br />to edit its properties.</p>
    </div>
  </aside>
</template>
