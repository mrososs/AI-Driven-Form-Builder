<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import {
  useMultiStepFormStore,
  type LogicRule,
  type RuleOperator,
} from '../../../stores/multistepForm'
import { RULE_KIND_META } from '../utils/icons'
import FieldGroup from './FieldGroup.vue'

const props = defineProps<{ rule: LogicRule }>()

const store = useMultiStepFormStore()

const meta = computed(() => RULE_KIND_META[props.rule.kind])

const sourceStep = computed(
  () =>
    store.steps.find(s => s.id === props.rule.if.stepId) ?? store.steps[0] ?? null
)
const sourceFields = computed(() => sourceStep.value?.elements ?? [])
const targetStep = computed(() =>
  store.steps.find(s => s.id === props.rule.then.targetStepId)
)

const operators = computed<Array<[RuleOperator, string]>>(() => {
  if (props.rule.kind === 'async') return [['asyncCheck', 'Async validate against endpoint']]
  if (props.rule.kind === 'require')
    return [
      ['isVerified', 'is verified'],
      ['notEmpty', 'is not empty'],
    ]
  return [
    ['equals', 'equals'],
    ['notEquals', 'does not equal'],
    ['in', 'is one of'],
    ['gt', 'greater than'],
    ['lt', 'less than'],
    ['empty', 'is empty'],
    ['notEmpty', 'is not empty'],
  ]
})

const operatorLabel = computed(
  () => operators.value.find(([k]) => k === props.rule.if.op)?.[1] ?? props.rule.if.op
)

const badgeClass = computed(
  () =>
    `inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${meta.value.badge}`
)

const thenLabelClass = computed(
  () =>
    `text-[10px] font-bold font-heading uppercase tracking-[0.14em] ${meta.value.strongText}`
)
</script>

<template>
  <div :key="rule.id" class="ms-fade-up space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span :class="badgeClass">
          <component :is="meta.icon" class="h-3 w-3" /> {{ meta.label }} rule
        </span>
        <label class="flex items-center gap-2 ms-1">
          <input
            type="checkbox"
            :checked="rule.enabled"
            @change="
              store.updateRule(rule.id, {
                enabled: ($event.target as HTMLInputElement).checked,
              })
            "
            class="h-3.5 w-3.5 text-indigo-600 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-transparent"
          />
          <span class="text-[12px] text-slate-700 dark:text-white/60">Enabled</span>
        </label>
      </div>
      <button
        type="button"
        @click="store.removeRule(rule.id)"
        class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-white/40 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg"
        aria-label="Delete rule"
      >
        <Trash2 class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- IF block -->
    <div data-tour="rule-editor-if" class="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111118] p-5 shadow-sm dark:shadow-none">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-[10px] font-bold font-heading uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-300">
          IF
        </span>
        <span class="h-px flex-1 bg-slate-200 dark:bg-white/[0.06]" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-[12px]">
        <FieldGroup label="In step">
          <select
            :value="rule.if.stepId ?? ''"
            @change="
              store.updateRule(rule.id, {
                if: {
                  stepId: ($event.target as HTMLSelectElement).value,
                  fieldLabel: '',
                  op: rule.if.op,
                  value: rule.if.value,
                },
              })
            "
            class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-2.5 py-2 text-[13px] text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:outline-none"
          >
            <option v-for="s in store.steps" :key="s.id" :value="s.id" class="bg-white dark:bg-[#111118]">
              {{ s.title }}
            </option>
          </select>
        </FieldGroup>
        <FieldGroup label="Field">
          <select
            :value="rule.if.fieldLabel ?? ''"
            @change="
              store.updateRule(rule.id, {
                if: {
                  stepId: rule.if.stepId,
                  fieldLabel: ($event.target as HTMLSelectElement).value,
                  op: rule.if.op,
                  value: rule.if.value,
                },
              })
            "
            class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-2.5 py-2 text-[13px] text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:outline-none"
          >
            <option value="" class="bg-white dark:bg-[#111118]">Select a field…</option>
            <option
              v-for="f in sourceFields"
              :key="f.id"
              :value="f.label"
              class="bg-white dark:bg-[#111118]"
            >
              {{ f.label }}
            </option>
          </select>
        </FieldGroup>
        <FieldGroup label="Operator">
          <select
            :value="rule.if.op"
            @change="
              store.updateRule(rule.id, {
                if: {
                  stepId: rule.if.stepId,
                  fieldLabel: rule.if.fieldLabel,
                  op: ($event.target as HTMLSelectElement).value as RuleOperator,
                  value: rule.if.value,
                },
              })
            "
            class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-2.5 py-2 text-[13px] text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:outline-none"
          >
            <option v-for="[k, l] in operators" :key="k" :value="k" class="bg-white dark:bg-[#111118]">
              {{ l }}
            </option>
          </select>
        </FieldGroup>
        <FieldGroup label="Value">
          <input
            :value="rule.if.value ?? ''"
            @input="
              store.updateRule(rule.id, {
                if: {
                  stepId: rule.if.stepId,
                  fieldLabel: rule.if.fieldLabel,
                  op: rule.if.op,
                  value: ($event.target as HTMLInputElement).value,
                },
              })
            "
            :placeholder="rule.kind === 'async' ? '/api/check/…' : 'value'"
            class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-2.5 py-2 text-[13px] text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:outline-none"
          />
        </FieldGroup>
      </div>
    </div>

    <!-- THEN block -->
    <div data-tour="rule-editor-then" class="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111118] p-5 shadow-sm dark:shadow-none">
      <div class="flex items-center gap-2 mb-4">
        <span :class="thenLabelClass">THEN</span>
        <span class="h-px flex-1 bg-slate-200 dark:bg-white/[0.06]" />
      </div>

      <FieldGroup
        v-if="rule.kind === 'branch' || rule.kind === 'skip'"
        :label="rule.kind === 'branch' ? 'Jump to step' : 'Skip this step'"
      >
        <select
          :value="rule.then.targetStepId ?? ''"
          @change="
            store.updateRule(rule.id, {
              then: {
                action: rule.then.action,
                targetStepId: ($event.target as HTMLSelectElement).value,
                note: rule.then.note,
              },
            })
          "
          class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-2.5 py-2 text-[13px] text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:outline-none max-w-sm"
        >
          <option v-for="s in store.steps" :key="s.id" :value="s.id" class="bg-white dark:bg-[#111118]">
            {{ s.title }}
          </option>
        </select>
      </FieldGroup>

      <FieldGroup
        v-if="rule.kind === 'require' || rule.kind === 'async'"
        label="Message shown to respondent"
      >
        <input
          :value="rule.then.note ?? ''"
          @input="
            store.updateRule(rule.id, {
              then: {
                action: rule.then.action,
                targetStepId: rule.then.targetStepId,
                note: ($event.target as HTMLInputElement).value,
              },
            })
          "
          class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-2.5 py-2 text-[13px] text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] focus:border-indigo-500 focus:outline-none max-w-lg"
        />
      </FieldGroup>

      <div
        class="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-[12.5px] text-slate-700 dark:text-white/70 leading-relaxed"
      >
        <span class="text-slate-500 dark:text-white/40">Summary: </span>
        <span class="text-indigo-700 dark:text-indigo-300">When </span>
        <span class="text-slate-900 dark:text-white font-medium">
          {{ rule.if.fieldLabel || '(field)' }}
        </span>
        <span class="text-slate-500 dark:text-white/50"> in </span>
        <span class="text-slate-900 dark:text-white font-medium">{{ sourceStep?.title }}</span>
        <span class="text-slate-500 dark:text-white/50"> {{ operatorLabel }} </span>
        <span v-if="rule.if.value" class="text-amber-700 dark:text-amber-300 font-mono">
          "{{ rule.if.value }}"
        </span>
        <span :class="meta.strongText">, {{ meta.label.toLowerCase() }} </span>
        <span v-if="targetStep" class="text-slate-900 dark:text-white font-medium">
          → {{ targetStep.title }}
        </span>
        <span v-if="rule.then.note" class="text-slate-700 dark:text-white/60">
          — {{ rule.then.note }}
        </span>
      </div>
    </div>
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
</style>
