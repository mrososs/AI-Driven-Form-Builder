<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Plus, HelpCircle } from 'lucide-vue-next'
import {
  useMultiStepFormStore,
  type LogicRule,
  type RuleKind,
} from '../../../stores/multistepForm'
import { STEP_ICONS, RULE_KIND_META } from '../utils/icons'
import RuleEditor from './RuleEditor.vue'
import TourTooltip from '../../../components/shared/TourTooltip.vue'
import { useTour } from '../../../composables/useTour'

const TOUR_STEPS = [
  {
    target: '[data-tour="logic-header"]',
    title: 'This is Logic',
    body: 'Rules control how users move through your form — <strong>branch</strong> to different steps, <strong>skip</strong> sections, <strong>gate</strong> on verification, or validate <strong>async</strong>.',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="logic-rules-panel"]',
    title: 'Your rules',
    body: 'Every rule you create lives here. Toggle it on/off without deleting it — disabled rules are preserved for later.',
    placement: 'right' as const,
  },
  {
    target: '[data-tour="logic-add-rule"]',
    title: 'Four rule kinds',
    body: '<strong>Branch</strong> jumps to any step. <strong>Skip</strong> bypasses the next step. <strong>Gate/Require</strong> blocks progression until a condition is met. <strong>Async</strong> calls an API endpoint before letting the user continue.',
    placement: 'right' as const,
  },
  {
    target: '[data-tour="rule-editor-if"]',
    title: 'IF — the condition',
    body: 'Pick which step and field to watch, choose an operator (equals, not empty, greater than…), and set the trigger value.',
    placement: 'top' as const,
  },
  {
    target: '[data-tour="rule-editor-then"]',
    title: 'THEN — the action',
    body: 'Choose where to go or what message to show. The summary at the bottom previews the full rule in plain English.',
    placement: 'top' as const,
  },
  {
    target: '[data-tour="logic-flow-diagram"]',
    title: 'Flow at a glance',
    body: 'The diagram shows all steps with their active rules. Click any rule badge to jump straight to its editor.',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="export-btn"]',
    title: 'Rules travel with your export',
    body: 'When you export, all enabled rules are included in the generated code and the AI prompt — no manual re-wiring needed.',
    placement: 'bottom' as const,
  },
]

const tour = useTour(TOUR_STEPS, 'logic-tour-seen')

onMounted(() => {
  tour.start()
})

const emit = defineEmits<{ exit: [] }>()

const store = useMultiStepFormStore()
const activeRuleId = ref<string | null>(store.rules[0]?.id ?? null)

watch(
  () => store.rules.map(r => r.id).join(','),
  () => {
    if (!activeRuleId.value || !store.rules.find(r => r.id === activeRuleId.value)) {
      activeRuleId.value = store.rules[0]?.id ?? null
    }
  }
)

const activeRule = computed<LogicRule | null>(
  () => store.rules.find(r => r.id === activeRuleId.value) ?? null
)

const enabledCount = computed(() => store.rules.filter(r => r.enabled).length)
const disabledCount = computed(() => store.rules.filter(r => !r.enabled).length)

const ruleKinds: RuleKind[] = ['branch', 'skip', 'require', 'async']

function previewSummary(rule: LogicRule) {
  if (rule.if.op === 'isVerified') return 'is verified'
  return rule.if.value ? `${rule.if.op} "${rule.if.value}"` : rule.if.op
}

function badgeForRule(rule: LogicRule) {
  return RULE_KIND_META[rule.kind].badge
}

function diagramRuleClasses(rule: LogicRule) {
  return RULE_KIND_META[rule.kind].chip
}

function addRuleColor(kind: RuleKind) {
  return RULE_KIND_META[kind].launcher
}

function ruleStrongText(rule: LogicRule) {
  return RULE_KIND_META[rule.kind].strongText
}

function activate(id: string) {
  activeRuleId.value = id
}
</script>

<template>
  <TourTooltip
    v-if="tour.active.value"
    :step="tour.currentStep()"
    :step-index="tour.stepIndex.value"
    :total-steps="tour.totalSteps"
    @next="tour.next()"
    @prev="tour.prev()"
    @end="tour.end()"
  />

  <div class="flex-1 min-h-0 flex">
    <!-- Left: rule list -->
    <aside
      data-tour="logic-rules-panel"
      class="w-72 shrink-0 bg-slate-50 dark:bg-[#0c0c12] border-e border-slate-200 dark:border-white/[0.06] flex flex-col"
      aria-label="Rules"
    >
      <div class="p-4 pb-3 border-b border-slate-200 dark:border-white/[0.05]">
        <h2 class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em]">
          Rules
        </h2>
        <p class="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">
          {{ store.rules.length }} active across {{ store.steps.length }} steps
        </p>
      </div>

      <div class="p-3 space-y-1.5 overflow-y-auto scrollbar-thin flex-1">
        <button
          v-for="r in store.rules"
          :key="r.id"
          type="button"
          @click="activate(r.id)"
          :class="[
            'w-full text-start p-3 rounded-xl border transition-all',
            r.id === activeRuleId
              ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg shadow-indigo-500/5 dark:border-indigo-500/40 dark:from-indigo-500/10 dark:to-violet-500/[0.06]'
              : 'border-transparent hover:border-slate-200 hover:bg-white dark:hover:border-white/10 dark:hover:bg-white/[0.03]',
          ]"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <div class="flex items-center gap-2 mb-1.5">
            <span
              :class="[
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border',
                badgeForRule(r),
              ]"
            >
              <component :is="RULE_KIND_META[r.kind].icon" class="h-2.5 w-2.5" />
              {{ RULE_KIND_META[r.kind].label }}
            </span>
            <span v-if="!r.enabled" class="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-wider">
              off
            </span>
          </div>
          <p class="text-[12.5px] font-semibold text-slate-900 dark:text-white/90 leading-tight truncate">
            {{ r.if.fieldLabel || 'Untitled rule' }}
          </p>
          <p class="text-[11px] text-slate-500 dark:text-white/40 mt-0.5 truncate">
            {{ previewSummary(r) }}
          </p>
        </button>
      </div>

      <div data-tour="logic-add-rule" class="p-3 border-t border-slate-200 dark:border-white/[0.05] space-y-1.5">
        <p class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider px-1">
          Add rule
        </p>
        <button
          v-for="kind in ruleKinds"
          :key="kind"
          type="button"
          @click="store.addRule(kind)"
          class="w-full flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/[0.06] dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/[0.06] text-start transition-all"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <div :class="['p-1.5 rounded-md', addRuleColor(kind)]">
            <component :is="RULE_KIND_META[kind].icon" class="h-3 w-3" />
          </div>
          <span class="text-[12px] font-medium text-slate-700 dark:text-white/80">
            {{ RULE_KIND_META[kind].label }}
          </span>
          <Plus class="h-3 w-3 ms-auto text-slate-400 dark:text-white/30" />
        </button>
      </div>
    </aside>

    <!-- Center: diagram + editor -->
    <main class="flex-1 min-w-0 flex flex-col bg-slate-100 dark:bg-[#0d0d14]">
      <div
        data-tour="logic-header"
        class="h-14 shrink-0 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/[0.05]"
      >
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="emit('exit')"
            class="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-900 dark:text-white/40 dark:hover:text-white/80 transition-colors"
          >
            <ChevronLeft class="h-3 w-3 rtl:rotate-180" /> Builder
          </button>
          <span class="text-slate-300 dark:text-white/20 mx-1">/</span>
          <span class="font-heading font-bold text-slate-900 dark:text-white text-[15px]">Logic</span>
        </div>
        <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-white/40">
          <span class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            {{ enabledCount }} enabled
          </span>
          <span class="h-3 w-px bg-slate-200 dark:bg-white/10" />
          <span class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/30" />
            {{ disabledCount }} disabled
          </span>
          <button
            type="button"
            @click="tour.forceStart()"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-white/30 dark:hover:text-white/70 dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Show logic tour"
            title="Show tour"
          >
            <HelpCircle class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto scrollbar-thin p-8">
        <div class="max-w-4xl mx-auto">
          <p class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em] mb-4">
            Flow diagram
          </p>
          <div
            data-tour="logic-flow-diagram"
            class="rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111118] p-6 mb-8 overflow-x-auto shadow-sm dark:shadow-none"
          >
            <div class="flex items-stretch gap-3 min-w-max">
              <template v-for="(s, i) in store.steps" :key="s.id">
                <div class="flex flex-col gap-2 w-44">
                  <div
                    class="rounded-xl border border-slate-200 bg-slate-50 dark:border-white/[0.09] dark:bg-gradient-to-br dark:from-white/[0.04] dark:to-transparent p-3"
                  >
                    <div class="flex items-center gap-2 mb-1.5">
                      <div
                        class="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white"
                      >
                        <component :is="STEP_ICONS[s.icon]" class="h-3 w-3" />
                      </div>
                      <span class="text-[10px] font-bold tabular-nums text-slate-500 dark:text-white/40">
                        {{ String(i + 1).padStart(2, '0') }}
                      </span>
                    </div>
                    <p class="text-[12.5px] font-semibold text-slate-900 dark:text-white truncate">
                      {{ s.title }}
                    </p>
                    <p class="text-[10.5px] text-slate-500 dark:text-white/40 mt-0.5">
                      {{ s.elements.length }} fields
                    </p>
                  </div>
                  <button
                    v-for="r in store.rules.filter(
                      (r) => r.if.stepId === s.id && r.enabled
                    )"
                    :key="r.id"
                    type="button"
                    @click="activate(r.id)"
                    :class="[
                      'text-start px-2 py-1.5 rounded-md border text-[10.5px] font-medium leading-tight transition-colors',
                      diagramRuleClasses(r),
                    ]"
                    style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
                  >
                    <span :class="[ruleStrongText(r), 'font-bold']">
                      {{ RULE_KIND_META[r.kind].label }}:
                    </span>
                    {{ r.if.fieldLabel }}
                  </button>
                </div>
                <div v-if="i < store.steps.length - 1" class="flex items-center pt-4">
                  <div class="relative w-6 h-px bg-slate-200 dark:bg-white/10">
                    <ChevronRight
                      class="absolute -end-1 -top-[6px] h-3 w-3 text-slate-400 dark:text-white/30 rtl:rotate-180"
                    />
                  </div>
                </div>
              </template>
            </div>
          </div>

          <RuleEditor v-if="activeRule" :rule="activeRule" />
          <div
            v-else-if="store.rules.length === 0"
            class="rounded-2xl border border-dashed border-slate-300 dark:border-white/[0.08] p-12 text-center bg-white/60 dark:bg-transparent"
          >
            <p class="text-slate-700 dark:text-white/70 font-semibold text-sm mb-1">No rules yet</p>
            <p class="text-slate-500 dark:text-white/40 text-sm">
              Add a rule from the sidebar to branch, gate, or skip steps based on user answers.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
