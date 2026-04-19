<script setup lang="ts">
import draggable from 'vuedraggable'
import { useFormStore } from '../../stores/form'
import { Layers, Save, Eye } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import FormElementCard from './components/FormElementCard.vue'
import RowElementCard from './components/RowElementCard.vue'

const formStore = useFormStore()
const router = useRouter()

async function handleSave() {
  try {
    await formStore.saveFormToFirestore()
    // Optional: add local success feedback if needed
  } catch (error) {
    alert('Failed to save form. Please try again.')
  }
}
</script>

<template>
  <main class="flex-1 flex flex-col min-w-0">
    <!-- Top Bar -->
    <header class="h-16 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-white/[0.07] px-8 flex items-center justify-between gap-4 shrink-0">
      <input
        v-model="formStore.title"
        class="text-lg font-bold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 min-w-0 w-56 truncate placeholder:text-slate-500 dark:placeholder:text-white/30"
        aria-label="Form title"
        placeholder="Untitled Form"
      />
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="formStore.hasElements && router.push('/preview')"
          :disabled="!formStore.hasElements"
          :class="formStore.hasElements
            ? 'flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors'
            : 'flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 dark:text-white/25 rounded-lg cursor-not-allowed'"
          :title="formStore.hasElements ? 'Preview form' : 'Add elements to preview'"
        >
          <Eye class="h-4 w-4" />
          Preview
        </button>
        <button
          @click="handleSave"
          class="btn-primary flex items-center gap-2 text-sm"
          :disabled="formStore.isSaving"
        >
          <Save class="h-4 w-4" :class="{ 'animate-spin': formStore.isSaving }" />
          {{ formStore.isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </header>

    <!-- Canvas Area -->
    <div class="flex-1 overflow-y-auto p-8 lg:p-12 flex justify-center bg-slate-50 dark:bg-[#0d0d14]">
      <div class="w-full max-w-2xl space-y-4">
        <!-- Form Header Card -->
        <div class="bg-white dark:bg-[#111118] rounded-2xl shadow-sm dark:shadow-black/30 border border-slate-200 dark:border-white/[0.07] p-8">
          <input
            v-model="formStore.title"
            class="text-3xl font-bold text-slate-900 dark:text-white w-full border-none focus:outline-none focus:ring-0 p-0 mb-2 placeholder:text-slate-300 dark:placeholder:text-white/20 bg-transparent"
            placeholder="Form Title"
            aria-label="Form title"
          />
          <textarea
            v-model="formStore.description"
            class="text-slate-500 dark:text-white/40 w-full border-none focus:outline-none focus:ring-0 p-0 resize-none h-10 text-sm placeholder:text-slate-500 dark:placeholder:text-white/30 bg-transparent"
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
              class="border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-16 text-center"
            >
              <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                <Layers class="h-6 w-6 text-slate-500 dark:text-white/30" aria-hidden="true" />
              </div>
              <p class="text-slate-600 dark:text-white/50 font-semibold text-sm mb-1">Your form is empty</p>
              <p class="text-slate-500 dark:text-white/30 text-sm">Add elements from the sidebar, or let AI build it for you.</p>
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
