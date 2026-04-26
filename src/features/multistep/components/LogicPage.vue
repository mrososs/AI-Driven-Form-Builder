<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'
import {
  useMultiStepFormStore,
  type LogicRule,
  type RuleKind,
} from '../../../stores/multistepForm'
import { STEP_ICONS, RULE_KIND_META } from '../utils/icons'
import RuleEditor from './RuleEditor.vue'

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
  <div class="flex-1 min-h-0 flex">
    <!-- Left: rule list -->
    <aside
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

      <div class="p-3 border-t border-slate-200 dark:border-white/[0.05] space-y-1.5">
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
        </div>
      </div>

      <div class="flex-1 overflow-y-auto scrollbar-thin p-8">
        <div class="max-w-4xl mx-auto">
          <p class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em] mb-4">
            Flow diagram
          </p>
          <div
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
