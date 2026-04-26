<script setup lang="ts">
import { Check, ChevronDown } from 'lucide-vue-next'
import { useMultiStepFormStore, type ProgressStyle } from '../../../stores/multistepForm'
import FieldGroup from './FieldGroup.vue'
import ToggleRow from './ToggleRow.vue'

const store = useMultiStepFormStore()

const styles: Array<{ key: ProgressStyle; label: string; sub: string }> = [
  { key: 'numbered', label: 'Numbered bar', sub: '01 — 06' },
  { key: 'bar', label: 'Progress bar', sub: 'Simple filled bar' },
  { key: 'dots', label: 'Dots', sub: 'Minimal indicator' },
  { key: 'sidebar', label: 'Sidebar list', sub: 'Steps shown on the side' },
]
</script>

<template>
  <div class="space-y-5 ms-fade-up">
    <FieldGroup label="Progress indicator">
      <div class="space-y-1.5">
        <button
          v-for="s in styles"
          :key="s.key"
          type="button"
          @click="store.setProgressStyle(s.key)"
          :class="[
            'w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-start',
            store.progressStyle === s.key
              ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-500/[0.08]'
              : 'border-slate-200 dark:border-white/[0.06] hover:border-indigo-300 hover:bg-slate-50 dark:hover:border-indigo-500/30 dark:hover:bg-white/[0.04]',
          ]"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <div>
            <p class="text-[13px] font-semibold text-slate-900 dark:text-white">{{ s.label }}</p>
            <p class="text-[11px] text-slate-500 dark:text-white/40">{{ s.sub }}</p>
          </div>
          <div
            v-if="store.progressStyle === s.key"
            class="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white"
          >
            <Check class="h-2.5 w-2.5" />
          </div>
        </button>
      </div>
    </FieldGroup>

    <details class="group border border-slate-200 dark:border-white/[0.07] rounded-lg" open>
      <summary class="flex items-center justify-between cursor-pointer px-3 py-2.5 list-none">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">
          Flow behavior
        </span>
        <ChevronDown class="h-3.5 w-3.5 text-slate-400 dark:text-white/40 group-open:rotate-180 transition-transform" />
      </summary>
      <div class="px-3 pb-3 pt-1 space-y-1.5">
        <ToggleRow
          label="Linear (steps must be completed in order)"
          :model-value="store.flow.linear"
          @update:model-value="(v: boolean) => store.setFlow({ linear: v })"
        />
        <ToggleRow
          label="Require all mandatory fields per step"
          :model-value="store.flow.requireAll"
          @update:model-value="(v: boolean) => store.setFlow({ requireAll: v })"
        />
        <ToggleRow label="Auto-save answers as respondent progresses" :default-on="true" />
        <ToggleRow label="Allow Back after submission" />
      </div>
    </details>

    <details class="group border border-slate-200 dark:border-white/[0.07] rounded-lg">
      <summary class="flex items-center justify-between cursor-pointer px-3 py-2.5 list-none">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">
          Completion
        </span>
        <ChevronDown class="h-3.5 w-3.5 text-slate-400 dark:text-white/40 group-open:rotate-180 transition-transform" />
      </summary>
      <div class="px-3 pb-3 pt-1 space-y-2.5">
        <FieldGroup label="Success message">
          <input
            value="Your tenant is ready 🎉"
            class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </FieldGroup>
        <FieldGroup label="Redirect URL">
          <input
            value="https://app.formai.dev/dashboard"
            class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </FieldGroup>
      </div>
    </details>
  </div>
</template>

<style scoped>
.ms-fade-up {
  animation: ms-fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes ms-fade-up {
  from {
    opacity: 0;
    transform: translateY(6px);
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

summary::-webkit-details-marker {
  display: none;
}
</style>
