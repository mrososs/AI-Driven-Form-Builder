<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown, Plus, Trash2 } from 'lucide-vue-next'
import {
  useMultiStepFormStore,
  type FormStep,
  type StepBehavior,
  type LogicRule,
  type RuleKind,
} from '../../../stores/multistepForm'
import { STEP_ICON_OPTIONS, RULE_KIND_META } from '../utils/icons'
import { useMultiStepUI } from '../composables/useMultiStepUI'
import FieldGroup from './FieldGroup.vue'
import ToggleRow from './ToggleRow.vue'

const props = defineProps<{ step: FormStep }>()
const emit = defineEmits<{ update: [patch: Partial<FormStep>] }>()

const store = useMultiStepFormStore()
const { setMode } = useMultiStepUI()

const behavior = computed<Required<StepBehavior>>(() => {
  const b = props.step.behavior ?? {}
  return {
    requireAll: b.requireAll ?? store.flow.requireAll,
    allowSkip: b.allowSkip ?? false,
    sendVerificationOnEnter:
      b.sendVerificationOnEnter ?? props.step.title.toLowerCase().includes('verify'),
    autoSaveOnExit: b.autoSaveOnExit ?? true,
  }
})

function setBehavior(patch: Partial<StepBehavior>) {
  emit('update', { behavior: { ...(props.step.behavior ?? {}), ...patch } })
}

const stepRules = computed<LogicRule[]>(() =>
  store.rules.filter((r) => r.if.stepId === props.step.id),
)

const ruleKinds: RuleKind[] = ['branch', 'skip', 'require', 'async']

function ruleSummary(rule: LogicRule): string {
  const field = rule.if.fieldLabel || 'a field'
  if (rule.if.op === 'isVerified') return `${field} is verified`
  if (rule.if.op === 'asyncCheck') return `${field} async-checks`
  if (rule.if.op === 'empty') return `${field} is empty`
  if (rule.if.op === 'notEmpty') return `${field} is not empty`
  const v = rule.if.value || '…'
  return `${field} ${rule.if.op} "${v}"`
}

function targetStepLabel(rule: LogicRule): string {
  const id = rule.then.targetStepId
  if (!id) return ''
  const target = store.steps.find((s) => s.id === id)
  return target ? target.title : ''
}

function addRule(kind: RuleKind) {
  store.addRule(kind, props.step.id)
  setMode('logic')
}

function openLogic() {
  setMode('logic')
}
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
        <ToggleRow
          label="Require all fields before continuing"
          :model-value="behavior.requireAll"
          @update:model-value="(v: boolean) => setBehavior({ requireAll: v })"
        />
        <ToggleRow
          label="Allow skipping this step"
          :model-value="behavior.allowSkip"
          @update:model-value="(v: boolean) => setBehavior({ allowSkip: v })"
        />
        <ToggleRow
          label="Send verification on enter"
          :model-value="behavior.sendVerificationOnEnter"
          @update:model-value="(v: boolean) => setBehavior({ sendVerificationOnEnter: v })"
        />
        <ToggleRow
          label="Save progress on exit"
          :model-value="behavior.autoSaveOnExit"
          @update:model-value="(v: boolean) => setBehavior({ autoSaveOnExit: v })"
        />
      </div>
    </details>

    <details class="group border border-slate-200 dark:border-white/[0.07] rounded-lg" open>
      <summary class="flex items-center justify-between cursor-pointer px-3 py-2.5 list-none">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">
          Logic rules ({{ stepRules.length }})
        </span>
        <ChevronDown class="h-3.5 w-3.5 text-slate-400 dark:text-white/40 group-open:rotate-180 transition-transform" />
      </summary>
      <div class="px-3 pb-3 pt-1 space-y-2.5">
        <p class="text-[12px] text-slate-500 dark:text-white/40 leading-relaxed">
          Branch, skip, gate, or async-validate based on answers in this step.
        </p>

        <div v-if="stepRules.length > 0" class="space-y-1.5">
          <button
            v-for="r in stepRules"
            :key="r.id"
            type="button"
            @click="openLogic"
            class="w-full text-start p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/[0.06] dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/[0.06] transition-colors"
            style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
          >
            <div class="flex items-center gap-1.5 mb-1">
              <span
                :class="[
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border',
                  RULE_KIND_META[r.kind].badge,
                ]"
              >
                <component :is="RULE_KIND_META[r.kind].icon" class="h-2.5 w-2.5" />
                {{ RULE_KIND_META[r.kind].label }}
              </span>
              <span
                v-if="!r.enabled"
                class="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-wider"
              >
                off
              </span>
              <button
                type="button"
                @click.stop="store.removeRule(r.id)"
                class="ms-auto p-0.5 text-slate-400 hover:text-rose-500 dark:text-white/30 dark:hover:text-rose-400 rounded"
                aria-label="Delete rule"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
            <p class="text-[12px] text-slate-700 dark:text-white/80 truncate">
              <span class="text-slate-500 dark:text-white/40">If</span>
              {{ ruleSummary(r) }}
            </p>
            <p
              v-if="(r.kind === 'branch' || r.kind === 'skip') && targetStepLabel(r)"
              class="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5 truncate"
            >
              → {{ targetStepLabel(r) }}
            </p>
            <p
              v-else-if="r.then.note"
              class="text-[11px] text-slate-500 dark:text-white/40 mt-0.5 truncate"
            >
              {{ r.then.note }}
            </p>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="kind in ruleKinds"
            :key="kind"
            type="button"
            @click="addRule(kind)"
            class="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/[0.06] dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/[0.06] transition-colors text-start"
          >
            <div :class="['p-1 rounded', RULE_KIND_META[kind].launcher]">
              <component :is="RULE_KIND_META[kind].icon" class="h-3 w-3" />
            </div>
            <span class="text-[11px] font-medium text-slate-700 dark:text-white/80 truncate">
              {{ RULE_KIND_META[kind].label }}
            </span>
            <Plus class="h-3 w-3 ms-auto text-slate-400 dark:text-white/30 shrink-0" />
          </button>
        </div>
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
