<script setup lang="ts">
import { computed } from 'vue'
import { Trash2, ChevronDown } from 'lucide-vue-next'
import type { MultiStepElement } from '../../../stores/multistepForm'
import FieldGroup from './FieldGroup.vue'

const props = defineProps<{ element: MultiStepElement }>()
const emit = defineEmits<{ update: [patch: Partial<MultiStepElement>] }>()

const showsPlaceholder = computed(() =>
  ['text', 'textarea', 'email', 'phone', 'number'].includes(props.element.type)
)
const isOptionsKind = computed(() =>
  props.element.type === 'select' || props.element.type === 'radio'
)

function updateOption(i: number, value: string) {
  const next = [...(props.element.options ?? [])]
  next[i] = value
  emit('update', { options: next })
}

function removeOption(i: number) {
  const next = [...(props.element.options ?? [])]
  next.splice(i, 1)
  emit('update', { options: next })
}

function addOption() {
  const list = props.element.options ?? []
  emit('update', { options: [...list, `Option ${list.length + 1}`] })
}
</script>

<template>
  <div :key="element.id" class="space-y-5 ms-fade-up">
    <FieldGroup label="Label">
      <input
        :value="element.label"
        @input="emit('update', { label: ($event.target as HTMLInputElement).value })"
        class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
      />
    </FieldGroup>

    <FieldGroup v-if="showsPlaceholder" label="Placeholder">
      <input
        :value="element.placeholder ?? ''"
        @input="emit('update', { placeholder: ($event.target as HTMLInputElement).value })"
        class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
      />
    </FieldGroup>

    <label
      class="flex items-center gap-3 p-3 border border-slate-200 dark:border-white/[0.07] rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04]"
    >
      <input
        type="checkbox"
        :checked="!!element.required"
        @change="emit('update', { required: ($event.target as HTMLInputElement).checked })"
        class="h-4 w-4 text-indigo-600 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-transparent"
      />
      <span class="text-sm font-medium text-slate-700 dark:text-white/75">Required field</span>
    </label>

    <FieldGroup v-if="isOptionsKind" label="Options">
      <div class="space-y-1.5">
        <div
          v-for="(opt, i) in element.options ?? []"
          :key="i"
          class="flex items-center gap-2"
        >
          <input
            :value="opt"
            @input="updateOption(i, ($event.target as HTMLInputElement).value)"
            class="flex-1 min-w-0 border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            @click="removeOption(i)"
            class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-white/40 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg"
            :aria-label="'Remove option ' + (i + 1)"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          @click="addOption"
          class="w-full py-1.5 text-[12px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          + Add option
        </button>
      </div>
    </FieldGroup>

    <details class="group border border-slate-200 dark:border-white/[0.07] rounded-lg">
      <summary class="flex items-center justify-between cursor-pointer px-3 py-2.5 list-none">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">
          Visibility rules
        </span>
        <ChevronDown
          class="h-3.5 w-3.5 text-slate-400 dark:text-white/40 group-open:rotate-180 transition-transform"
        />
      </summary>
      <div class="px-3 pb-3 pt-1 text-[12px] text-slate-500 dark:text-white/40 leading-relaxed">
        Show this field only when another field (in this step or earlier steps) matches a
        condition.
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
