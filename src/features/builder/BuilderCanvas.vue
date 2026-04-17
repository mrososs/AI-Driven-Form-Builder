<script setup lang="ts">
import draggable from 'vuedraggable'
import { useFormStore } from '../../stores/form'
import { Layers, Save, Eye } from 'lucide-vue-next'
import FormElementCard from './components/FormElementCard.vue'
import RowElementCard from './components/RowElementCard.vue'

const formStore = useFormStore()
</script>

<template>
  <main class="flex-1 flex flex-col min-w-0">
    <!-- Top Bar -->
    <header class="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between gap-4 shrink-0">
      <input
        v-model="formStore.title"
        class="text-lg font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 min-w-0 w-56 truncate placeholder:text-slate-500"
        aria-label="Form title"
        placeholder="Untitled Form"
      />
      <div class="flex items-center gap-2 shrink-0">
        <button
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 rounded-lg cursor-not-allowed"
          disabled
          title="Preview coming soon"
        >
          <Eye class="h-4 w-4" />
          Preview
        </button>
        <button
          @click="formStore.saveForm()"
          class="btn-primary flex items-center gap-2 text-sm"
          :disabled="formStore.isSaving"
        >
          <Save class="h-4 w-4" />
          {{ formStore.isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </header>

    <!-- Canvas Area -->
    <div class="flex-1 overflow-y-auto p-8 lg:p-12 flex justify-center bg-slate-50">
      <div class="w-full max-w-2xl space-y-4">
        <!-- Form Header Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <input
            v-model="formStore.title"
            class="text-3xl font-bold text-slate-900 w-full border-none focus:outline-none focus:ring-0 p-0 mb-2 placeholder:text-slate-300"
            placeholder="Form Title"
            aria-label="Form title"
          />
          <textarea
            v-model="formStore.description"
            class="text-slate-500 w-full border-none focus:outline-none focus:ring-0 p-0 resize-none h-10 text-sm placeholder:text-slate-500"
            placeholder="Add a description..."
            aria-label="Form description"
          ></textarea>
        </div>

        <!-- Draggable Items -->
        <draggable
          v-model="formStore.elements"
          item-key="id"
          group="canvas"
          handle=".drag-handle"
          class="space-y-3 min-h-[60px]"
          ghost-class="opacity-40"
        >
          <template #item="{ element }">
            <RowElementCard v-if="element.type === 'row'" :element="element" />
            <FormElementCard v-else :element="element" />
          </template>

          <template #footer>
            <div
              v-if="formStore.elements.length === 0"
              class="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center"
            >
              <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Layers class="h-6 w-6 text-slate-500" aria-hidden="true" />
              </div>
              <p class="text-slate-600 font-semibold text-sm mb-1">Your form is empty</p>
              <p class="text-slate-500 text-sm">Add elements from the sidebar, or let AI build it for you.</p>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </main>
</template>

<style scoped>
.drag-handle {
  touch-action: none;
}
</style>
