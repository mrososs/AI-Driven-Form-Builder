<script setup lang="ts">
import { Plus, Sparkles, Layers } from 'lucide-vue-next'
import { useMultiStepFormStore, TEMPLATES } from '../../../stores/multistepForm'

const store = useMultiStepFormStore()
</script>

<template>
  <main
    class="flex-1 min-w-0 flex items-center justify-center bg-slate-100 dark:bg-[#0d0d14] p-8 lg:p-12"
  >
    <div class="max-w-md text-center ms-fade-up">
      <div
        class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-50 border border-indigo-200 dark:from-indigo-500/20 dark:to-violet-500/10 dark:border-indigo-500/25 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/5"
      >
        <Layers class="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
      </div>
      <h1 class="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-2">
        No steps yet
      </h1>
      <p class="text-slate-500 dark:text-white/50 text-sm leading-relaxed mb-8">
        Multi-step forms break long flows into focused steps. Add a step to start building, or load a
        template to see a working example you can edit.
      </p>

      <div class="flex flex-col sm:flex-row gap-2 justify-center mb-8">
        <button
          type="button"
          @click="store.addStep()"
          class="ms-builder-primary inline-flex items-center justify-center gap-2 text-sm"
        >
          <Plus class="h-3.5 w-3.5" /> Add your first step
        </button>
      </div>

      <div class="text-start">
        <p class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em] mb-3">
          Templates
        </p>
        <button
          v-for="t in TEMPLATES"
          :key="t.id"
          type="button"
          @click="store.applyTemplate(t.id)"
          class="w-full flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111118] hover:border-indigo-300 hover:bg-indigo-50 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/[0.06] transition-all group"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <div
            class="p-2 rounded-lg bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:group-hover:bg-indigo-500/20 transition-colors shrink-0"
          >
            <Sparkles class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ t.name }}</p>
            <p class="text-[12px] text-slate-500 dark:text-white/50 mt-0.5 leading-relaxed">
              {{ t.description }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.ms-builder-primary {
  background-image: linear-gradient(to right, #4f46e5, #6366f1);
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -10px rgba(99, 102, 241, 0.55);
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.ms-builder-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -10px rgba(99, 102, 241, 0.7);
}

.ms-fade-up {
  animation: ms-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes ms-fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ms-fade-up {
    animation: none;
  }
}
</style>
