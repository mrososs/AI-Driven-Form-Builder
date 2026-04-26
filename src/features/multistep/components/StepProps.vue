<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { FormStep } from '../../../stores/multistepForm'
import { STEP_ICON_OPTIONS } from '../utils/icons'
import FieldGroup from './FieldGroup.vue'
import ToggleRow from './ToggleRow.vue'

const props = defineProps<{ step: FormStep }>()
const emit = defineEmits<{ update: [patch: Partial<FormStep>] }>()

const verifyDefault = computed(() => props.step.title.toLowerCase().includes('verify'))
</script>

<template>
  <div :key="step.id" class="space-y-5 ms-fade-up">
    <FieldGroup label="Step title">
      <input
        :value="step.title"
        @input="emit('update', { title: ($event.target as HTMLInputElement).value })"
        class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
      />
    </FieldGroup>
    <FieldGroup label="Description">
      <textarea
        :value="step.description"
        rows="3"
        @input="
          emit('update', { description: ($event.target as HTMLTextAreaElement).value })
        "
        class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none focus:outline-none"
      />
    </FieldGroup>
    <FieldGroup label="Step icon">
      <div class="grid grid-cols-6 gap-1.5">
        <button
          v-for="opt in STEP_ICON_OPTIONS"
          :key="opt.key"
          type="button"
          @click="emit('update', { icon: opt.key })"
          :class="[
            'aspect-square rounded-lg flex items-center justify-center transition-all',
            step.icon === opt.key
              ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white ring-1 ring-white/20'
              : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/[0.06] hover:border-indigo-400 dark:hover:border-indigo-400/40 hover:text-indigo-600 dark:hover:text-indigo-300',
          ]"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
          :aria-label="`Use ${opt.key} icon`"
        >
          <component :is="opt.icon" class="h-3.5 w-3.5" />
        </button>
      </div>
    </FieldGroup>

    <details class="group border border-slate-200 dark:border-white/[0.07] rounded-lg" open>
      <summary class="flex items-center justify-between cursor-pointer px-3 py-2.5 list-none">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">
          Step Logic
        </span>
        <ChevronDown class="h-3.5 w-3.5 text-slate-400 dark:text-white/40 group-open:rotate-180 transition-transform" />
      </summary>
      <div class="px-3 pb-3 pt-1 space-y-2 text-[12px]">
        <ToggleRow label="Require all fields before continuing" :default-on="true" />
        <ToggleRow label="Allow skipping this step" />
        <ToggleRow label="Send verification on enter" :default-on="verifyDefault" />
        <ToggleRow label="Save progress on exit" :default-on="true" />
      </div>
    </details>

    <details class="group border border-slate-200 dark:border-white/[0.07] rounded-lg">
      <summary class="flex items-center justify-between cursor-pointer px-3 py-2.5 list-none">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">
          Branch condition
        </span>
        <ChevronDown class="h-3.5 w-3.5 text-slate-400 dark:text-white/40 group-open:rotate-180 transition-transform" />
      </summary>
      <div class="px-3 pb-3 pt-1 space-y-2">
        <p class="text-[12px] text-slate-500 dark:text-white/40 leading-relaxed">
          Route respondents to a different step based on an answer in this step.
        </p>
        <div
          class="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-[12px] text-slate-700 dark:text-white/60"
        >
          <span class="text-slate-500 dark:text-white/40">If</span>
          <span class="text-indigo-700 dark:text-indigo-300">Company size</span>
          <span class="text-slate-500 dark:text-white/40">is</span>
          <span class="text-indigo-700 dark:text-indigo-300">201+</span>
          <span class="text-slate-500 dark:text-white/40">→ go to</span>
          <span class="text-indigo-700 dark:text-indigo-300">Plan &amp; billing</span>
        </div>
        <button
          type="button"
          class="w-full py-1.5 text-[12px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg"
        >
          + Add rule
        </button>
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
