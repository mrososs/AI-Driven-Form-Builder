import type {
  CardItem,
  FlowSettings,
  FormStep,
  LogicRule,
  MultiStepElement,
  RangeUnit,
} from '../../../stores/multistepForm'
import { flattenStepFields } from '../../../stores/multistepForm'

const DEFAULT_FLOW: FlowSettings = { linear: true, requireAll: true }

export type MultiStepFramework = 'vue' | 'react' | 'angular'

export interface GeneratedCode {
  filename: string
  code: string
}

interface FieldDescriptor {
  key: string
  type: MultiStepElement['type']
  label: string
  placeholder: string
  required: boolean
  options: string[]
  cards: CardItem[]
  rangeUnit: RangeUnit
  min: number | null
  max: number | null
  step: number
  defaultValue: number | null
}

interface StepDescriptor {
  title: string
  description: string
  requireAll: boolean
  allowSkip: boolean
  fields: FieldDescriptor[]
}

interface ResolvedRule {
  kind: string
  ifStepIdx: number
  ifFieldKey: string
  op: string
  value: string
  targetStepIdx: number
  note: string
}

function slug(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function describeFields(steps: FormStep[], flowRequireAll: boolean): StepDescriptor[] {
  const usedKeys = new Set<string>()
  return steps.map(s => ({
    title: s.title,
    description: s.description,
    requireAll: s.behavior?.requireAll ?? flowRequireAll,
    allowSkip: s.behavior?.allowSkip ?? false,
    fields: flattenStepFields(s.elements).map(e => {
      let key = slug(e.label) || `field_${Math.random().toString(36).slice(2, 6)}`
      let suffix = 1
      while (usedKeys.has(key)) {
        suffix++
        key = `${slug(e.label) || 'field'}_${suffix}`
      }
      usedKeys.add(key)
      return {
        key,
        type: e.type,
        label: e.label,
        placeholder: e.placeholder ?? '',
        required: !!e.required,
        options: e.options ?? [],
        cards: (e.cards ?? []).map((c) => ({ ...c })),
        rangeUnit: (e.rangeUnit ?? 'days') as RangeUnit,
        min: typeof e.min === 'number' ? e.min : null,
        max: typeof e.max === 'number' ? e.max : null,
        step: typeof e.step === 'number' ? e.step : 1,
        defaultValue: typeof e.defaultValue === 'number' ? e.defaultValue : null,
      }
    }),
  }))
}


function resolveRules(
  rules: LogicRule[],
  steps: FormStep[],
  descriptors: StepDescriptor[]
): ResolvedRule[] {
  const stepIdToIdx = new Map(steps.map((s, i) => [s.id, i]))
  const labelToKey = new Map<string, string>()
  for (const desc of descriptors) {
    for (const f of desc.fields) labelToKey.set(f.label, f.key)
  }
  return rules
    .filter(r => r.enabled && !!r.if.fieldLabel)
    .map(r => ({
      kind: r.kind,
      ifStepIdx: stepIdToIdx.get(r.if.stepId) ?? 0,
      ifFieldKey: labelToKey.get(r.if.fieldLabel) ?? slug(r.if.fieldLabel),
      op: r.if.op,
      value: r.if.value ?? '',
      targetStepIdx: stepIdToIdx.get(r.then.targetStepId ?? '') ?? 0,
      note: r.then.note ?? '',
    }))
}

function sharedRuleHelpersTS(rules: ResolvedRule[]): string {
  return `
interface ResolvedRule { kind: string; ifStepIdx: number; ifFieldKey: string; op: string; value: string; targetStepIdx: number; note: string }
const RULES: ResolvedRule[] = ${JSON.stringify(rules, null, 2)}

function evaluateCondition(op: string, fieldVal: unknown, ruleVal: string): boolean {
  const v = String(fieldVal ?? '').trim()
  if (op === 'equals') return v === ruleVal
  if (op === 'notEquals') return v !== ruleVal
  if (op === 'in') return ruleVal.split(',').map((s: string) => s.trim()).includes(v)
  if (op === 'gt') return Number(fieldVal) > Number(ruleVal)
  if (op === 'lt') return Number(fieldVal) < Number(ruleVal)
  if (op === 'empty') return v === ''
  if (op === 'notEmpty') return v !== ''
  return false
}
function getNextStepIndex(idx: number, formState: Record<string, unknown>): number {
  for (const r of RULES) {
    if ((r.kind !== 'branch' && r.kind !== 'skip') || r.ifStepIdx !== idx) continue
    if (!evaluateCondition(r.op, formState[r.ifFieldKey], r.value)) continue
    if (r.kind === 'branch') return r.targetStepIdx
    if (r.kind === 'skip' && r.targetStepIdx === idx + 1) return idx + 2
  }
  return idx + 1
}
function checkGate(idx: number, formState: Record<string, unknown>): string | null {
  for (const r of RULES) {
    if (r.kind !== 'require' || r.ifStepIdx !== idx) continue
    if (!evaluateCondition(r.op, formState[r.ifFieldKey], r.value)) {
      return r.note || 'Please complete this field before continuing.'
    }
  }
  return null
}`
}

// ──────────────────────────────────────────────────────────────────────────
// Vue 3 — Composition API + <script setup> + Tailwind
// ──────────────────────────────────────────────────────────────────────────

function generateVue(steps: StepDescriptor[], rules: ResolvedRule[]): string {
  const hasRules = rules.length > 0
  const stepsLiteral = JSON.stringify(steps, null, 2)
  const rulesBlock = hasRules ? sharedRuleHelpersTS(rules) : ''
  const gateRefs = hasRules
    ? `const gateError = ref<string | null>(null)\nconst asyncPending = ref(false)`
    : ''
  const nextFn = hasRules
    ? `async function next() {
  const gate = checkGate(stepIndex.value, formData.value)
  if (gate) { gateError.value = gate; return }
  gateError.value = null
  if (!stepValid(currentStep.value)) { showErrors.value = true; return }
  showErrors.value = false
  const ar = RULES.find(r => r.kind === 'async' && r.ifStepIdx === stepIndex.value)
  if (ar) {
    asyncPending.value = true
    try {
      const res = await fetch(ar.value, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: formData.value[ar.ifFieldKey] }) })
      if (!res.ok) { gateError.value = ar.note || 'Validation failed.'; return }
    } catch { gateError.value = ar.note || 'Validation request failed.'; return }
    finally { asyncPending.value = false }
  }
  if (isLast.value) { submit() } else {
    const ni = getNextStepIndex(stepIndex.value, formData.value)
    if (ni >= steps.length) submit(); else stepIndex.value = ni
  }
}`
    : `function next() {
  if (!stepValid(currentStep.value)) {
    showErrors.value = true
    return
  }
  showErrors.value = false
  if (isLast.value) {
    submit()
  } else {
    stepIndex.value++
  }
}`

  return `<!--
  Generated by FormAI — Multi-step form
  Stack: Vue 3 + <script setup> + TypeScript + Tailwind CSS
  Drop into any Vue 3 + Tailwind project. No external runtime required.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Card { value: string; title: string; description?: string; meta?: string }
interface Field {
  key: string
  type: string
  label: string
  placeholder: string
  required: boolean
  options: string[]
  cards: Card[]
  rangeUnit: 'nights' | 'days' | 'hours' | 'weeks'
  min: number | null
  max: number | null
  step: number
  defaultValue: number | null
}

interface Step {
  title: string
  description: string
  requireAll: boolean
  allowSkip: boolean
  fields: Field[]
}

const steps: Step[] = ${stepsLiteral}
${rulesBlock}

const stepIndex = ref(0)
const formData = ref<Record<string, unknown>>({})
const completed = ref(false)
const showErrors = ref(false)
${gateRefs}

const currentStep = computed(() => steps[stepIndex.value])
const isFirst = computed(() => stepIndex.value === 0)
const isLast = computed(() => stepIndex.value === steps.length - 1)
const progress = computed(() => ((stepIndex.value + 1) / steps.length) * 100)

const UNIT_MS: Record<Field['rangeUnit'], number> = {
  hours: 3_600_000,
  days: 86_400_000,
  nights: 86_400_000,
  weeks: 7 * 86_400_000,
}

function rangeParts(field: Field) {
  const raw = String(formData.value[field.key] ?? '')
  const [start = '', end = ''] = raw.split('|')
  return { start, end }
}

function setRangeStart(field: Field, value: string) {
  const { end } = rangeParts(field)
  formData.value[field.key] = \`\${value}|\${end}\`
}

function setRangeEnd(field: Field, value: string) {
  const { start } = rangeParts(field)
  formData.value[field.key] = \`\${start}|\${value}\`
}

function rangeDelta(field: Field): string {
  const { start, end } = rangeParts(field)
  if (!start || !end) return ''
  const a = Date.parse(start)
  const b = Date.parse(end)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return ''
  const delta = Math.max(0, Math.round((b - a) / UNIT_MS[field.rangeUnit]))
  const label = delta === 1 ? field.rangeUnit.replace(/s$/, '') : field.rangeUnit
  return \`\${delta} \${label}\`
}

function clampStep(field: Field, v: number): number {
  const min = field.min ?? 0
  const max = field.max ?? Number.POSITIVE_INFINITY
  return Math.min(max, Math.max(min, v))
}

function stepperValue(field: Field): number {
  const raw = formData.value[field.key]
  const parsed = Number(raw)
  if (Number.isFinite(parsed)) return parsed
  return field.defaultValue ?? field.min ?? 0
}

function bumpStepper(field: Field, direction: 1 | -1) {
  const next = clampStep(field, stepperValue(field) + direction * field.step)
  formData.value[field.key] = next
}

function isCardSelected(field: Field, value: string): boolean {
  const raw = formData.value[field.key]
  if (Array.isArray(raw)) return raw.includes(value)
  return raw === value
}

function selectRadioCard(field: Field, value: string) {
  formData.value[field.key] = value
}

function toggleCheckboxCard(field: Field, value: string) {
  const raw = formData.value[field.key]
  const list = Array.isArray(raw) ? [...raw] : []
  const idx = list.indexOf(value)
  if (idx === -1) list.push(value)
  else list.splice(idx, 1)
  formData.value[field.key] = list
}

function isFieldFilled(field: Field): boolean {
  const value = formData.value[field.key]
  if (field.type === 'checkbox') return value === true
  if (field.type === 'otp') return typeof value === 'string' && value.length === 6
  if (field.type === 'stepper') return typeof value === 'number' && Number.isFinite(value)
  if (field.type === 'daterange') {
    const { start, end } = rangeParts(field)
    return !!start && !!end
  }
  if (field.type === 'radiocards') return typeof value === 'string' && value.length > 0
  if (field.type === 'checkboxcards') return Array.isArray(value) && value.length > 0
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function stepValid(step: Step): boolean {
  if (step.allowSkip) return true
  return step.fields.every(f => {
    const mustFill = step.requireAll || f.required
    return !mustFill || isFieldFilled(f)
  })
}

${nextFn}

function back() {
  if (!isFirst.value) {
    stepIndex.value--
    showErrors.value = false
  }
}

async function submit() {
  // TODO: replace with your real submit endpoint.
  // await fetch('/api/forms/${slug(steps[0]?.title || 'submission')}', { method: 'POST', body: JSON.stringify(formData.value) })
  completed.value = true
}

function setOtpDigit(field: Field, index: number, value: string) {
  const digit = value.replace(/\\D/g, '').slice(0, 1)
  const current = String(formData.value[field.key] ?? '')
  const next = current.padEnd(6, ' ').split('')
  next[index] = digit || ' '
  formData.value[field.key] = next.join('').replace(/\\s/g, '')
}

function reset() {
  stepIndex.value = 0
  formData.value = {}
  completed.value = false
  showErrors.value = false
}
<\/script>

<template>
  <div class="mx-auto w-full max-w-xl p-6">
    <!-- Progress bar -->
    <div class="mb-6">
      <div class="h-1 rounded-full bg-slate-200 overflow-hidden">
        <div
          class="h-full bg-indigo-500 transition-all duration-500"
          :style="{ width: progress + '%' }"
        />
      </div>
      <p class="mt-2 text-xs text-slate-500 tabular-nums">
        Step {{ stepIndex + 1 }} of {{ steps.length }}
      </p>
    </div>

    <!-- Completion -->
    <div
      v-if="completed"
      class="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
    >
      <h1 class="text-2xl font-bold text-slate-900 mb-2">All done!</h1>
      <p class="text-sm text-slate-600 mb-6">Your responses have been submitted.</p>
      <button
        type="button"
        @click="reset"
        class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
      >
        Start over
      </button>
    </div>

    <!-- Active step -->
    <form v-else @submit.prevent="next" class="rounded-2xl border border-slate-200 bg-white p-8">
      <h1 class="text-2xl font-bold text-slate-900">{{ currentStep.title }}</h1>
      <p v-if="currentStep.description" class="mt-1 text-sm text-slate-500">
        {{ currentStep.description }}
      </p>

      <div class="mt-6 space-y-4">
        <div v-for="field in currentStep.fields" :key="field.key">
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">
            {{ field.label }}
            <span v-if="field.required" class="text-rose-500" aria-hidden="true">*</span>
          </label>

          <!-- text/email/number/phone/date -->
          <input
            v-if="['text', 'email', 'phone', 'number', 'date', 'url', 'password'].includes(field.type)"
            v-model="formData[field.key]"
            :type="field.type === 'phone' ? 'tel' : field.type"
            :placeholder="field.placeholder"
            :required="field.required"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          />

          <!-- textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.key]"
            :placeholder="field.placeholder"
            :required="field.required"
            rows="3"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
          />

          <!-- otp -->
          <div v-else-if="field.type === 'otp'" class="flex gap-2" dir="ltr">
            <input
              v-for="i in 6"
              :key="i"
              :value="String(formData[field.key] ?? '').charAt(i - 1)"
              @input="(e) => setOtpDigit(field, i - 1, (e.target as HTMLInputElement).value)"
              maxlength="1"
              inputmode="numeric"
              class="w-11 h-12 text-center text-lg font-mono rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>

          <!-- select -->
          <select
            v-else-if="field.type === 'select'"
            v-model="formData[field.key]"
            :required="field.required"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none bg-white"
          >
            <option value="">Select…</option>
            <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <!-- radio -->
          <div v-else-if="field.type === 'radio'" class="space-y-2">
            <label
              v-for="opt in field.options"
              :key="opt"
              class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer"
            >
              <input
                v-model="formData[field.key]"
                :name="field.key"
                :value="opt"
                type="radio"
                class="text-indigo-600"
                :required="field.required"
              />
              <span class="text-sm text-slate-700">{{ opt }}</span>
            </label>
          </div>

          <!-- checkbox -->
          <label
            v-else-if="field.type === 'checkbox'"
            class="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer"
          >
            <input
              v-model="formData[field.key]"
              type="checkbox"
              class="mt-0.5 text-indigo-600 rounded"
              :required="field.required"
            />
            <span class="text-sm text-slate-700">{{ field.label }}</span>
          </label>

          <!-- file -->
          <input
            v-else-if="field.type === 'file'"
            type="file"
            @change="(e) => (formData[field.key] = (e.target as HTMLInputElement).files?.[0])"
            :required="field.required"
            class="w-full text-sm text-slate-700"
          />

          <!-- stepper -->
          <div
            v-else-if="field.type === 'stepper'"
            class="flex items-stretch border border-slate-200 rounded-lg overflow-hidden bg-white"
          >
            <button
              type="button"
              :disabled="stepperValue(field) <= (field.min ?? 0)"
              @click="bumpStepper(field, -1)"
              class="px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-30"
              :aria-label="'Decrement ' + field.label"
            >
              −
            </button>
            <input
              type="number"
              :value="stepperValue(field)"
              :min="field.min ?? undefined"
              :max="field.max ?? undefined"
              :step="field.step"
              @input="(e) => (formData[field.key] = clampStep(field, Number((e.target as HTMLInputElement).value)))"
              class="flex-1 min-w-0 text-center text-sm font-medium text-slate-900 bg-transparent border-x border-slate-200 outline-none"
            />
            <button
              type="button"
              :disabled="field.max != null && stepperValue(field) >= field.max"
              @click="bumpStepper(field, 1)"
              class="px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-30"
              :aria-label="'Increment ' + field.label"
            >
              +
            </button>
          </div>

          <!-- daterange -->
          <div
            v-else-if="field.type === 'daterange'"
            class="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <input
              type="date"
              :value="rangeParts(field).start"
              @input="(e) => setRangeStart(field, (e.target as HTMLInputElement).value)"
              class="flex-1 min-w-0 bg-transparent text-sm text-slate-900 outline-none"
            />
            <span class="text-slate-400 text-sm" aria-hidden="true">→</span>
            <input
              type="date"
              :value="rangeParts(field).end"
              :min="rangeParts(field).start || undefined"
              @input="(e) => setRangeEnd(field, (e.target as HTMLInputElement).value)"
              class="flex-1 min-w-0 bg-transparent text-sm text-slate-900 outline-none"
            />
            <span
              v-if="rangeDelta(field)"
              class="text-xs font-medium text-indigo-600 ms-2 shrink-0"
            >
              {{ rangeDelta(field) }}
            </span>
          </div>

          <!-- radiocards -->
          <div v-else-if="field.type === 'radiocards'" class="space-y-2">
            <label
              v-for="card in field.cards"
              :key="card.value"
              :class="[
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                isCardSelected(field, card.value)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white',
              ]"
            >
              <input
                type="radio"
                :name="field.key"
                :value="card.value"
                :checked="isCardSelected(field, card.value)"
                @change="selectRadioCard(field, card.value)"
                :required="field.required"
                class="text-indigo-600"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-900 truncate">{{ card.title }}</div>
                <div v-if="card.description" class="text-xs text-slate-500 truncate">{{ card.description }}</div>
              </div>
              <div v-if="card.meta" class="text-sm font-medium text-slate-700 shrink-0">{{ card.meta }}</div>
            </label>
          </div>

          <!-- checkboxcards -->
          <div v-else-if="field.type === 'checkboxcards'" class="space-y-2">
            <label
              v-for="card in field.cards"
              :key="card.value"
              :class="[
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                isCardSelected(field, card.value)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white',
              ]"
            >
              <input
                type="checkbox"
                :checked="isCardSelected(field, card.value)"
                @change="toggleCheckboxCard(field, card.value)"
                class="text-indigo-600 rounded"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-900 truncate">{{ card.title }}</div>
                <div v-if="card.description" class="text-xs text-slate-500 truncate">{{ card.description }}</div>
              </div>
              <div v-if="card.meta" class="text-sm font-medium text-slate-700 shrink-0">{{ card.meta }}</div>
            </label>
          </div>

          <!-- inline error -->
          <p
            v-if="showErrors && field.required && !isFieldFilled(field)"
            class="mt-1.5 text-xs text-rose-600"
          >
            This field is required.
          </p>
        </div>
      </div>

      ${hasRules ? `<div v-if="gateError" class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ gateError }}</div>` : ''}

      <div class="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          @click="back"
          :disabled="isFirst"
          class="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
        >
          Back
        </button>
        ${hasRules
          ? `<button type="submit" :disabled="asyncPending" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:pointer-events-none">
          <span v-if="asyncPending">Checking…</span><span v-else>{{ isLast ? 'Submit' : 'Continue' }}</span>
        </button>`
          : `<button type="submit" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25">
          {{ isLast ? 'Submit' : 'Continue' }}
        </button>`}
      </div>
    </form>
  </div>
</template>
`
}

// ──────────────────────────────────────────────────────────────────────────
// React 18+ — functional component + hooks + Tailwind
// ──────────────────────────────────────────────────────────────────────────

function generateReact(steps: StepDescriptor[], rules: ResolvedRule[]): string {
  const hasRules = rules.length > 0
  const stepsLiteral = JSON.stringify(steps, null, 2)
  const rulesBlock = hasRules ? sharedRuleHelpersTS(rules) : ''
  const gateState = hasRules
    ? `const [gateError, setGateError] = useState<string | null>(null)\n  const [asyncPending, setAsyncPending] = useState(false)`
    : ''
  const nextFn = hasRules
    ? `async function next() {
    const gate = checkGate(stepIndex, form)
    if (gate) { setGateError(gate); return }
    setGateError(null)
    if (!validateStep()) { setShowErrors(true); return }
    setShowErrors(false)
    const ar = RULES.find(r => r.kind === 'async' && r.ifStepIdx === stepIndex)
    if (ar) {
      setAsyncPending(true)
      try {
        const res = await fetch(ar.value, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: form[ar.ifFieldKey] }) })
        if (!res.ok) { setGateError(ar.note || 'Validation failed.'); return }
      } catch { setGateError(ar.note || 'Validation request failed.'); return }
      finally { setAsyncPending(false) }
    }
    if (isLast) submit()
    else {
      const ni = getNextStepIndex(stepIndex, form)
      if (ni >= steps.length) submit(); else setStepIndex(ni)
    }
  }`
    : `function next() {
    if (!validateStep()) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    if (isLast) submit()
    else setStepIndex((i) => i + 1)
  }`

  return `// Generated by FormAI — Multi-step form
// Stack: React 18+ + TypeScript + Tailwind CSS
// Drop into any React + Tailwind project. No external runtime required.
import { useMemo, useState, type ChangeEvent } from 'react'

interface Card { value: string; title: string; description?: string; meta?: string }
interface Field {
  key: string
  type: string
  label: string
  placeholder: string
  required: boolean
  options: string[]
  cards: Card[]
  rangeUnit: 'nights' | 'days' | 'hours' | 'weeks'
  min: number | null
  max: number | null
  step: number
  defaultValue: number | null
}

const UNIT_MS: Record<Field['rangeUnit'], number> = {
  hours: 3_600_000,
  days: 86_400_000,
  nights: 86_400_000,
  weeks: 7 * 86_400_000,
}

function parseRange(raw: unknown): { start: string; end: string } {
  const [start = '', end = ''] = String(raw ?? '').split('|')
  return { start, end }
}

function computeDelta(field: Field, raw: unknown): string {
  const { start, end } = parseRange(raw)
  if (!start || !end) return ''
  const a = Date.parse(start)
  const b = Date.parse(end)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return ''
  const delta = Math.max(0, Math.round((b - a) / UNIT_MS[field.rangeUnit]))
  const label = delta === 1 ? field.rangeUnit.replace(/s$/, '') : field.rangeUnit
  return \`\${delta} \${label}\`
}

function clampStep(field: Field, v: number): number {
  const min = field.min ?? 0
  const max = field.max ?? Number.POSITIVE_INFINITY
  return Math.min(max, Math.max(min, v))
}

function stepperValue(field: Field, raw: unknown): number {
  const parsed = Number(raw)
  if (Number.isFinite(parsed)) return parsed
  return field.defaultValue ?? field.min ?? 0
}

interface Step {
  title: string
  description: string
  requireAll: boolean
  allowSkip: boolean
  fields: Field[]
}

const steps: Step[] = ${stepsLiteral}
${rulesBlock}

type FormState = Record<string, unknown>

function isFilled(field: Field, value: unknown): boolean {
  if (field.type === 'checkbox') return value === true
  if (field.type === 'otp') return typeof value === 'string' && value.length === 6
  if (field.type === 'stepper') return typeof value === 'number' && Number.isFinite(value)
  if (field.type === 'daterange') {
    const { start, end } = parseRange(value)
    return !!start && !!end
  }
  if (field.type === 'radiocards') return typeof value === 'string' && value.length > 0
  if (field.type === 'checkboxcards') return Array.isArray(value) && value.length > 0
  return value !== undefined && value !== null && String(value).trim() !== ''
}

export default function MultiStepForm() {
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState<FormState>({})
  const [done, setDone] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  ${gateState}

  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1
  const progress = useMemo(() => ((stepIndex + 1) / steps.length) * 100, [stepIndex])

  function setField(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validateStep(): boolean {
    if (step.allowSkip) return true
    return step.fields.every((f) => {
      const mustFill = step.requireAll || f.required
      return !mustFill || isFilled(f, form[f.key])
    })
  }

  async function submit() {
    // TODO: replace with your real submit endpoint.
    // await fetch('/api/forms/submission', { method: 'POST', body: JSON.stringify(form) })
    setDone(true)
  }

  ${nextFn}

  function back() {
    if (!isFirst) {
      setStepIndex((i) => i - 1)
      setShowErrors(false)
    }
  }

  function setOtpDigit(field: Field, index: number, value: string) {
    const digit = value.replace(/\\D/g, '').slice(0, 1)
    const current = String(form[field.key] ?? '').padEnd(6, ' ').split('')
    current[index] = digit || ' '
    setField(field.key, current.join('').replace(/\\s/g, ''))
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-xl p-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">All done!</h1>
          <p className="text-sm text-slate-600 mb-6">Your responses have been submitted.</p>
          <button
            type="button"
            onClick={() => {
              setStepIndex(0)
              setForm({})
              setDone(false)
              setShowErrors(false)
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
          >
            Start over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <div className="mb-6">
        <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: \`\${progress}%\` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500 tabular-nums">
          Step {stepIndex + 1} of {steps.length}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          next()
        }}
        className="rounded-2xl border border-slate-200 bg-white p-8"
      >
        <h1 className="text-2xl font-bold text-slate-900">{step.title}</h1>
        {step.description && <p className="mt-1 text-sm text-slate-500">{step.description}</p>}

        <div className="mt-6 space-y-4">
          {step.fields.map((field) => {
            const value = form[field.key]
            const error = showErrors && field.required && !isFilled(field, value)
            const baseInput =
              'w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none'

            return (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {field.label}
                  {field.required && <span className="text-rose-500" aria-hidden="true">*</span>}
                </label>

                {['text', 'email', 'phone', 'number', 'date', 'url', 'password'].includes(field.type) && (
                  <input
                    type={field.type === 'phone' ? 'tel' : field.type}
                    value={(value as string) ?? ''}
                    onChange={(e) => setField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className={baseInput}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    value={(value as string) ?? ''}
                    onChange={(e) => setField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={3}
                    className={\`\${baseInput} resize-none\`}
                  />
                )}

                {field.type === 'otp' && (
                  <div className="flex gap-2" dir="ltr">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input
                        key={i}
                        value={(String(value ?? '')).charAt(i)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setOtpDigit(field, i, e.target.value)
                        }
                        maxLength={1}
                        inputMode="numeric"
                        className="w-11 h-12 text-center text-lg font-mono rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    ))}
                  </div>
                )}

                {field.type === 'select' && (
                  <select
                    value={(value as string) ?? ''}
                    onChange={(e) => setField(field.key, e.target.value)}
                    required={field.required}
                    className={\`\${baseInput} bg-white\`}
                  >
                    <option value="">Select…</option>
                    {field.options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && (
                  <div className="space-y-2">
                    {field.options.map((o) => (
                      <label
                        key={o}
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={field.key}
                          value={o}
                          checked={value === o}
                          onChange={() => setField(field.key, o)}
                          required={field.required}
                          className="text-indigo-600"
                        />
                        <span className="text-sm text-slate-700">{o}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'checkbox' && (
                  <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value === true}
                      onChange={(e) => setField(field.key, e.target.checked)}
                      required={field.required}
                      className="mt-0.5 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-slate-700">{field.label}</span>
                  </label>
                )}

                {field.type === 'file' && (
                  <input
                    type="file"
                    onChange={(e) => setField(field.key, e.target.files?.[0])}
                    required={field.required}
                    className="w-full text-sm text-slate-700"
                  />
                )}

                {field.type === 'stepper' && (
                  <div className="flex items-stretch border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      disabled={stepperValue(field, value) <= (field.min ?? 0)}
                      onClick={() => setField(field.key, clampStep(field, stepperValue(field, value) - field.step))}
                      className="px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                    >−</button>
                    <input
                      type="number"
                      value={stepperValue(field, value)}
                      min={field.min ?? undefined}
                      max={field.max ?? undefined}
                      step={field.step}
                      onChange={(e) => setField(field.key, clampStep(field, Number(e.target.value)))}
                      className="flex-1 min-w-0 text-center text-sm font-medium bg-transparent border-x border-slate-200 outline-none"
                    />
                    <button
                      type="button"
                      disabled={field.max != null && stepperValue(field, value) >= field.max}
                      onClick={() => setField(field.key, clampStep(field, stepperValue(field, value) + field.step))}
                      className="px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                    >+</button>
                  </div>
                )}

                {field.type === 'daterange' && (() => {
                  const parts = parseRange(value)
                  const delta = computeDelta(field, value)
                  return (
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                      <input
                        type="date"
                        value={parts.start}
                        onChange={(e) => setField(field.key, \`\${e.target.value}|\${parts.end}\`)}
                        className="flex-1 min-w-0 bg-transparent text-sm text-slate-900 outline-none"
                      />
                      <span aria-hidden="true" className="text-slate-400 text-sm">→</span>
                      <input
                        type="date"
                        value={parts.end}
                        min={parts.start || undefined}
                        onChange={(e) => setField(field.key, \`\${parts.start}|\${e.target.value}\`)}
                        className="flex-1 min-w-0 bg-transparent text-sm text-slate-900 outline-none"
                      />
                      {delta && (
                        <span className="text-xs font-medium text-indigo-600 ms-2 shrink-0">{delta}</span>
                      )}
                    </div>
                  )
                })()}

                {field.type === 'radiocards' && (
                  <div className="space-y-2">
                    {field.cards.map((card) => {
                      const selected = value === card.value
                      return (
                        <label
                          key={card.value}
                          className={\`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors \${selected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'}\`}
                        >
                          <input
                            type="radio"
                            name={field.key}
                            value={card.value}
                            checked={selected}
                            onChange={() => setField(field.key, card.value)}
                            required={field.required}
                            className="text-indigo-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">{card.title}</div>
                            {card.description && <div className="text-xs text-slate-500 truncate">{card.description}</div>}
                          </div>
                          {card.meta && <div className="text-sm font-medium text-slate-700 shrink-0">{card.meta}</div>}
                        </label>
                      )
                    })}
                  </div>
                )}

                {field.type === 'checkboxcards' && (
                  <div className="space-y-2">
                    {field.cards.map((card) => {
                      const selectedList = Array.isArray(value) ? value as string[] : []
                      const selected = selectedList.includes(card.value)
                      return (
                        <label
                          key={card.value}
                          className={\`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors \${selected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'}\`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              const next = selected
                                ? selectedList.filter((v) => v !== card.value)
                                : [...selectedList, card.value]
                              setField(field.key, next)
                            }}
                            className="text-indigo-600 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">{card.title}</div>
                            {card.description && <div className="text-xs text-slate-500 truncate">{card.description}</div>}
                          </div>
                          {card.meta && <div className="text-sm font-medium text-slate-700 shrink-0">{card.meta}</div>}
                        </label>
                      )
                    })}
                  </div>
                )}

                {error && <p className="mt-1.5 text-xs text-rose-600">This field is required.</p>}
              </div>
            )
          })}
        </div>

        ${hasRules ? `{gateError && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{gateError}</div>}` : ''}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={isFirst}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
          >
            Back
          </button>
          ${hasRules
            ? `<button type="submit" disabled={asyncPending} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:pointer-events-none">
            {asyncPending ? 'Checking…' : (isLast ? 'Submit' : 'Continue')}
          </button>`
            : `<button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25">
            {isLast ? 'Submit' : 'Continue'}
          </button>`}
        </div>
      </form>
    </div>
  )
}
`
}

// ──────────────────────────────────────────────────────────────────────────
// Angular 17+ — standalone + signals + Tailwind
// ──────────────────────────────────────────────────────────────────────────

function generateAngular(steps: StepDescriptor[], rules: ResolvedRule[]): string {
  const hasRules = rules.length > 0
  const stepsLiteral = JSON.stringify(steps, null, 2)
  const rulesBlock = hasRules ? sharedRuleHelpersTS(rules) : ''
  const gateSignals = hasRules
    ? `gateError = signal<string | null>(null)\n  asyncPending = signal(false)`
    : ''
  const ruleMethods = hasRules
    ? `
  private evaluateCondition(op: string, fieldVal: unknown, ruleVal: string): boolean {
    const v = String(fieldVal ?? '').trim()
    if (op === 'equals') return v === ruleVal
    if (op === 'notEquals') return v !== ruleVal
    if (op === 'in') return ruleVal.split(',').map((s: string) => s.trim()).includes(v)
    if (op === 'gt') return Number(fieldVal) > Number(ruleVal)
    if (op === 'lt') return Number(fieldVal) < Number(ruleVal)
    if (op === 'empty') return v === ''
    if (op === 'notEmpty') return v !== ''
    return false
  }
  private getNextIdx(): number {
    const idx = this.stepIndex()
    for (const r of RULES) {
      if ((r.kind !== 'branch' && r.kind !== 'skip') || r.ifStepIdx !== idx) continue
      if (!this.evaluateCondition(r.op, this.form[r.ifFieldKey], r.value)) continue
      if (r.kind === 'branch') return r.targetStepIdx
      if (r.kind === 'skip' && r.targetStepIdx === idx + 1) return idx + 2
    }
    return idx + 1
  }
  private checkGate(): string | null {
    const idx = this.stepIndex()
    for (const r of RULES) {
      if (r.kind !== 'require' || r.ifStepIdx !== idx) continue
      if (!this.evaluateCondition(r.op, this.form[r.ifFieldKey], r.value)) {
        return r.note || 'Please complete this field before continuing.'
      }
    }
    return null
  }`
    : ''
  const nextMethod = hasRules
    ? `async next() {
    const gate = this.checkGate()
    if (gate) { this.gateError.set(gate); return }
    this.gateError.set(null)
    if (!this.validate()) { this.showErrors.set(true); return }
    this.showErrors.set(false)
    const ar = RULES.find(r => r.kind === 'async' && r.ifStepIdx === this.stepIndex())
    if (ar) {
      this.asyncPending.set(true)
      try {
        const res = await fetch(ar.value, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: this.form[ar.ifFieldKey] }) })
        if (!res.ok) { this.gateError.set(ar.note || 'Validation failed.'); return }
      } catch { this.gateError.set(ar.note || 'Validation request failed.'); return }
      finally { this.asyncPending.set(false) }
    }
    if (this.isLast()) { this.submit() } else {
      const ni = this.getNextIdx()
      if (ni >= this.steps.length) this.submit(); else this.stepIndex.set(ni)
    }
  }`
    : `next() {
    if (!this.validate()) {
      this.showErrors.set(true)
      return
    }
    this.showErrors.set(false)
    if (this.isLast()) {
      this.submit()
    } else {
      this.stepIndex.update((i) => i + 1)
    }
  }`
  const gateTemplateBlock = hasRules
    ? `\n          @if (gateError()) {
            <div class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ gateError() }}</div>
          }`
    : ''
  const submitBtn = hasRules
    ? `<button type="submit" [disabled]="asyncPending()"
                    class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:pointer-events-none">
              {{ asyncPending() ? 'Checking...' : (isLast() ? 'Submit' : 'Continue') }}
            </button>`
    : `<button type="submit"
                    class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25">
              {{ isLast() ? 'Submit' : 'Continue' }}
            </button>`

  return `// Generated by FormAI — Multi-step form
// Stack: Angular 17+ standalone component + signals + Tailwind CSS
// Drop into any Angular 17+ project (zoneless-friendly).
import { Component, signal, computed } from '@angular/core'
import { FormsModule } from '@angular/forms'

interface Card { value: string; title: string; description?: string; meta?: string }
type RangeUnit = 'nights' | 'days' | 'hours' | 'weeks'
interface Field {
  key: string
  type: string
  label: string
  placeholder: string
  required: boolean
  options: string[]
  cards: Card[]
  rangeUnit: RangeUnit
  min: number | null
  max: number | null
  step: number
  defaultValue: number | null
}

const UNIT_MS: Record<RangeUnit, number> = {
  hours: 3_600_000,
  days: 86_400_000,
  nights: 86_400_000,
  weeks: 7 * 86_400_000,
}

interface Step {
  title: string
  description: string
  requireAll: boolean
  allowSkip: boolean
  fields: Field[]
}

const STEPS: Step[] = ${stepsLiteral}
${rulesBlock}

@Component({
  selector: 'app-multi-step-form',
  standalone: true,
  imports: [FormsModule],
  template: \`
    <div class="mx-auto w-full max-w-xl p-6">
      <div class="mb-6">
        <div class="h-1 rounded-full bg-slate-200 overflow-hidden">
          <div class="h-full bg-indigo-500 transition-all duration-500"
               [style.width.%]="progress()"></div>
        </div>
        <p class="mt-2 text-xs text-slate-500 tabular-nums">
          Step {{ stepIndex() + 1 }} of {{ steps.length }}
        </p>
      </div>

      @if (!completed()) {
        <form (submit)="$event.preventDefault(); next()"
              class="rounded-2xl border border-slate-200 bg-white p-8">
          <h1 class="text-2xl font-bold text-slate-900">{{ currentStep().title }}</h1>
          @if (currentStep().description) {
            <p class="mt-1 text-sm text-slate-500">{{ currentStep().description }}</p>
          }

          <div class="mt-6 space-y-4">
            @for (field of currentStep().fields; track field.key) {
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5">
                  {{ field.label }}
                  @if (field.required) {
                    <span class="text-rose-500" aria-hidden="true">*</span>
                  }
                </label>

                @if (textTypes.includes(field.type)) {
                  <input
                    [type]="field.type === 'phone' ? 'tel' : field.type"
                    [placeholder]="field.placeholder"
                    [required]="field.required"
                    [(ngModel)]="form[field.key]" [name]="field.key"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                } @else if (field.type === 'textarea') {
                  <textarea
                    [placeholder]="field.placeholder"
                    [required]="field.required"
                    rows="3"
                    [(ngModel)]="form[field.key]" [name]="field.key"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none resize-none"></textarea>
                } @else if (field.type === 'select') {
                  <select
                    [required]="field.required"
                    [(ngModel)]="form[field.key]" [name]="field.key"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select…</option>
                    @for (o of field.options; track o) {
                      <option [value]="o">{{ o }}</option>
                    }
                  </select>
                } @else if (field.type === 'radio') {
                  <div class="space-y-2">
                    @for (o of field.options; track o) {
                      <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer">
                        <input type="radio" [name]="field.key" [value]="o"
                               [(ngModel)]="form[field.key]" [required]="field.required"
                               class="text-indigo-600" />
                        <span class="text-sm text-slate-700">{{ o }}</span>
                      </label>
                    }
                  </div>
                } @else if (field.type === 'checkbox') {
                  <label class="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer">
                    <input type="checkbox" [(ngModel)]="form[field.key]"
                           [name]="field.key" [required]="field.required"
                           class="mt-0.5 text-indigo-600 rounded" />
                    <span class="text-sm text-slate-700">{{ field.label }}</span>
                  </label>
                } @else if (field.type === 'file') {
                  <input type="file"
                         (change)="form[field.key] = $any($event.target).files?.[0]"
                         [required]="field.required"
                         class="w-full text-sm text-slate-700" />
                } @else if (field.type === 'stepper') {
                  <div class="flex items-stretch border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button type="button"
                            [disabled]="stepperValue(field) <= (field.min ?? 0)"
                            (click)="bumpStepper(field, -1)"
                            class="px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-30">−</button>
                    <input type="number"
                           [value]="stepperValue(field)"
                           [min]="field.min" [max]="field.max" [step]="field.step"
                           (input)="form[field.key] = $any($event.target).valueAsNumber"
                           class="flex-1 min-w-0 text-center text-sm font-medium bg-transparent border-x border-slate-200 outline-none" />
                    <button type="button"
                            [disabled]="field.max != null && stepperValue(field) >= field.max"
                            (click)="bumpStepper(field, 1)"
                            class="px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-30">+</button>
                  </div>
                } @else if (field.type === 'daterange') {
                  @let parts = rangeParts(field);
                  @let delta = rangeDelta(field);
                  <div class="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                    <input type="date"
                           [value]="parts.start"
                           (input)="setRangeStart(field, $any($event.target).value)"
                           class="flex-1 min-w-0 bg-transparent text-sm text-slate-900 outline-none" />
                    <span aria-hidden="true" class="text-slate-400 text-sm">→</span>
                    <input type="date"
                           [value]="parts.end"
                           [min]="parts.start || null"
                           (input)="setRangeEnd(field, $any($event.target).value)"
                           class="flex-1 min-w-0 bg-transparent text-sm text-slate-900 outline-none" />
                    @if (delta) {
                      <span class="text-xs font-medium text-indigo-600 ms-2 shrink-0">{{ delta }}</span>
                    }
                  </div>
                } @else if (field.type === 'radiocards') {
                  <div class="space-y-2">
                    @for (card of field.cards; track card.value) {
                      @let selected = isCardSelected(field, card.value);
                      <label
                        [class]="'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ' + (selected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white')">
                        <input type="radio"
                               [name]="field.key"
                               [value]="card.value"
                               [checked]="selected"
                               (change)="selectRadioCard(field, card.value)"
                               [required]="field.required"
                               class="text-indigo-600" />
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-semibold text-slate-900 truncate">{{ card.title }}</div>
                          @if (card.description) {
                            <div class="text-xs text-slate-500 truncate">{{ card.description }}</div>
                          }
                        </div>
                        @if (card.meta) {
                          <div class="text-sm font-medium text-slate-700 shrink-0">{{ card.meta }}</div>
                        }
                      </label>
                    } @empty {
                      <p class="text-xs text-slate-400 italic">No cards configured.</p>
                    }
                  </div>
                } @else if (field.type === 'checkboxcards') {
                  <div class="space-y-2">
                    @for (card of field.cards; track card.value) {
                      @let selected = isCardSelected(field, card.value);
                      <label
                        [class]="'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ' + (selected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white')">
                        <input type="checkbox"
                               [checked]="selected"
                               (change)="toggleCheckboxCard(field, card.value)"
                               class="text-indigo-600 rounded" />
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-semibold text-slate-900 truncate">{{ card.title }}</div>
                          @if (card.description) {
                            <div class="text-xs text-slate-500 truncate">{{ card.description }}</div>
                          }
                        </div>
                        @if (card.meta) {
                          <div class="text-sm font-medium text-slate-700 shrink-0">{{ card.meta }}</div>
                        }
                      </label>
                    } @empty {
                      <p class="text-xs text-slate-400 italic">No cards configured.</p>
                    }
                  </div>
                }

                @if (showErrors() && field.required && !isFilled(field)) {
                  <p class="mt-1.5 text-xs text-rose-600">This field is required.</p>
                }
              </div>
            }
          </div>

          ${gateTemplateBlock}

          <div class="mt-8 flex items-center justify-between gap-3">
            <button type="button" (click)="back()" [disabled]="isFirst()"
                    class="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none">Back</button>
            ${submitBtn}
          </div>
        </form>
      } @else {
        <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <h1 class="text-2xl font-bold text-slate-900 mb-2">All done!</h1>
          <p class="text-sm text-slate-600 mb-6">Your responses have been submitted.</p>
          <button type="button" (click)="reset()"
                  class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50">Start over</button>
        </div>
      }
    </div>
  \`,
})
export class MultiStepFormComponent {
  steps = STEPS
  textTypes = ['text', 'email', 'phone', 'number', 'date', 'url', 'password']
  stepIndex = signal(0)
  completed = signal(false)
  showErrors = signal(false)
  form: Record<string, unknown> = {}
  ${gateSignals}

  currentStep = computed(() => this.steps[this.stepIndex()])
  isFirst = computed(() => this.stepIndex() === 0)
  isLast = computed(() => this.stepIndex() === this.steps.length - 1)
  progress = computed(() => ((this.stepIndex() + 1) / this.steps.length) * 100)

  isFilled(field: Field): boolean {
    const value = this.form[field.key]
    if (field.type === 'checkbox') return value === true
    if (field.type === 'otp') return typeof value === 'string' && value.length === 6
    if (field.type === 'stepper') return typeof value === 'number' && Number.isFinite(value)
    if (field.type === 'daterange') {
      const { start, end } = this.rangeParts(field)
      return !!start && !!end
    }
    if (field.type === 'radiocards') return typeof value === 'string' && value.length > 0
    if (field.type === 'checkboxcards') return Array.isArray(value) && value.length > 0
    return value !== undefined && value !== null && String(value).trim() !== ''
  }

  rangeParts(field: Field): { start: string; end: string } {
    const raw = String(this.form[field.key] ?? '')
    const [start = '', end = ''] = raw.split('|')
    return { start, end }
  }
  setRangeStart(field: Field, value: string): void {
    const { end } = this.rangeParts(field)
    this.form[field.key] = \`\${value}|\${end}\`
  }
  setRangeEnd(field: Field, value: string): void {
    const { start } = this.rangeParts(field)
    this.form[field.key] = \`\${start}|\${value}\`
  }
  rangeDelta(field: Field): string {
    const { start, end } = this.rangeParts(field)
    if (!start || !end) return ''
    const a = Date.parse(start)
    const b = Date.parse(end)
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return ''
    const delta = Math.max(0, Math.round((b - a) / UNIT_MS[field.rangeUnit]))
    const label = delta === 1 ? field.rangeUnit.replace(/s$/, '') : field.rangeUnit
    return \`\${delta} \${label}\`
  }
  stepperValue(field: Field): number {
    const raw = this.form[field.key]
    const parsed = Number(raw)
    if (Number.isFinite(parsed)) return parsed
    return field.defaultValue ?? field.min ?? 0
  }
  bumpStepper(field: Field, direction: 1 | -1): void {
    const min = field.min ?? 0
    const max = field.max ?? Number.POSITIVE_INFINITY
    const next = Math.min(max, Math.max(min, this.stepperValue(field) + direction * field.step))
    this.form[field.key] = next
  }
  isCardSelected(field: Field, value: string): boolean {
    const raw = this.form[field.key]
    if (Array.isArray(raw)) return raw.includes(value)
    return raw === value
  }
  selectRadioCard(field: Field, value: string): void {
    this.form[field.key] = value
  }
  toggleCheckboxCard(field: Field, value: string): void {
    const raw = this.form[field.key]
    const list: string[] = Array.isArray(raw) ? [...raw] : []
    const idx = list.indexOf(value)
    if (idx === -1) list.push(value)
    else list.splice(idx, 1)
    this.form[field.key] = list
  }

  validate(): boolean {
    const step = this.currentStep()
    if (step.allowSkip) return true
    return step.fields.every((f) => {
      const mustFill = step.requireAll || f.required
      return !mustFill || this.isFilled(f)
    })
  }

  ${nextMethod}

  back() {
    if (!this.isFirst()) {
      this.stepIndex.update((i) => i - 1)
      this.showErrors.set(false)
    }
  }

  async submit() {
    // TODO: replace with your real submit endpoint.
    // await fetch('/api/forms/submission', { method: 'POST', body: JSON.stringify(this.form) })
    this.completed.set(true)
  }

  reset() {
    this.stepIndex.set(0)
    this.form = {}
    this.completed.set(false)
    this.showErrors.set(false)
  }
  ${ruleMethods}
}
`
}

export function generateMultiStepCode(
  framework: MultiStepFramework,
  steps: FormStep[],
  rules: LogicRule[] = [],
  flow: FlowSettings = DEFAULT_FLOW,
): GeneratedCode {
  const descriptors = describeFields(steps, flow.requireAll)
  const resolved = resolveRules(rules, steps, descriptors)

  if (framework === 'vue') {
    return { filename: 'MultiStepForm.vue', code: generateVue(descriptors, resolved) }
  }
  if (framework === 'react') {
    return { filename: 'MultiStepForm.tsx', code: generateReact(descriptors, resolved) }
  }
  return {
    filename: 'multi-step-form.component.ts',
    code: generateAngular(descriptors, resolved),
  }
}

// ──────────────────────────────────────────────────────────────────────────
// AI prompt — a strict brief an LLM can execute, not a vague request.
// ──────────────────────────────────────────────────────────────────────────

const FRAMEWORK_BRIEF: Record<MultiStepFramework, string> = {
  vue: `Vue 3 with <script setup lang="ts">, ref/computed, no Pinia (component-local state). Style with Tailwind CSS. Use v-model on inputs. Single-file component.`,
  react: `React 18+ functional component with TypeScript and hooks (useState, useMemo). Style with Tailwind CSS. Default export. No external state library.`,
  angular: `Angular 17+ standalone component with signals (signal/computed) and FormsModule [(ngModel)]. Style with Tailwind CSS. Importable directly.`,
}

function fieldLine(f: FieldDescriptor): string {
  const pieces = [`- ${f.label} (\`${f.key}\`, type: ${f.type})`]
  if (f.required) pieces.push('required')
  if (f.placeholder) pieces.push(`placeholder: "${f.placeholder}"`)
  if (f.options.length) pieces.push(`options: [${f.options.map(o => `"${o}"`).join(', ')}]`)
  return pieces.join(' · ')
}

function describeRuleForPrompt(r: LogicRule, steps: FormStep[]): string {
  const sourceStep = steps.find(s => s.id === r.if.stepId)
  const targetStep = steps.find(s => s.id === r.then.targetStepId)
  const kind = r.kind.toUpperCase()
  const field = r.if.fieldLabel || '(field)'
  const stepName = sourceStep?.title || '(step)'
  const op = r.if.op === 'isVerified' ? 'is verified' : r.if.op === 'asyncCheck' ? 'passes async check at' : r.if.op
  const val = r.if.value ? ` "${r.if.value}"` : ''
  const endpoint = r.kind === 'async' ? ` ${r.if.value}` : ''
  const target = targetStep ? ` → step "${targetStep.title}"` : ''
  const note = r.then.note ? `; show: "${r.then.note}"` : ''
  return `- ${kind}: When "${field}" in step "${stepName}" ${op}${val}${endpoint}${target}${note}`
}

export function generateMultiStepPrompt(
  framework: MultiStepFramework,
  steps: FormStep[],
  rules: LogicRule[] = [],
  flow: FlowSettings = DEFAULT_FLOW,
): string {
  const descriptors = describeFields(steps, flow.requireAll)
  const stepBlocks = descriptors
    .map((s, i) => {
      const flags: string[] = []
      if (s.allowSkip) flags.push('allow-skip')
      if (s.requireAll) flags.push('require-all-fields')
      const flagLine = flags.length ? `_(behavior: ${flags.join(', ')})_\n` : ''
      return (
        `### Step ${i + 1}: ${s.title}\n` +
        (s.description ? `_${s.description}_\n` : '') +
        flagLine +
        s.fields.map(fieldLine).join('\n')
      )
    })
    .join('\n\n')

  const enabledRules = rules.filter(r => r.enabled && r.if.fieldLabel)
  const logicSection = enabledRules.length > 0
    ? `\n## Conditional Logic\n\nImplement the following rules. Evaluate them after every field change and re-evaluate the next-step target just before the user advances.\n\n${enabledRules.map(r => describeRuleForPrompt(r, steps)).join('\n')}\n`
    : ''

  return `You are a senior ${framework} engineer. Build a production-ready multi-step form using the spec below.

## Stack
${FRAMEWORK_BRIEF[framework]}

## Steps & fields

${stepBlocks}
${logicSection}
## Behavior

1. Render exactly one step at a time. The user advances with **Continue** and goes back with **Back**.
2. The Continue button on the last step is labeled **Submit** and posts \`form\` as JSON to a placeholder \`/api/forms/submission\` endpoint, then shows a success state with a "Start over" action.
3. Validate per-step before advancing: every \`required\` field must have a non-empty value. For checkbox-type fields, "non-empty" means checked (\`true\`). For OTP-type fields, "non-empty" means exactly 6 digits. Honor each step's behavior flags: when \`allow-skip\` is set, skip validation for that step; when \`require-all-fields\` is set, every field on that step (not just \`required\` ones) must be non-empty.
4. Show inline error messages only after the user attempts to advance ("This field is required.").
5. Maintain a single \`form\` state object keyed by each field's \`key\` (snake_case generated from the label).
6. Render a slim progress bar at the top showing \`(stepIndex + 1) / totalSteps\` and a small "Step N of M" counter.
7. Disable **Back** on the first step. Reset \`showErrors\` whenever the active step changes.
${
  steps.some(s => flattenStepFields(s.elements).some(e => e.type === 'otp'))
    ? `8. For OTP fields, render six 1-character inputs side-by-side, auto-advance focus to the next box on input, and combine them into a single string in \`form[key]\`.\n`
    : ''
}

## Field rendering

| type | element |
|---|---|
| text / email / phone / number / date / url / password | \`<input>\` with the matching HTML type (use \`tel\` for phone) |
| textarea | \`<textarea rows=3>\` |
| select | \`<select>\` with options + a default "Select…" placeholder |
| radio | stacked label cards with one \`<input type="radio">\` each |
| checkbox | single label card with a checkbox; the field's label doubles as the prompt |
| otp | six 1-char numeric inputs side-by-side |
| file | \`<input type="file">\` storing the first selected File in state |

## Styling

Use Tailwind utility classes only. Light theme. Primary accent: \`indigo-500\`/\`indigo-600\`. Rounded corners (\`rounded-lg\`/\`rounded-2xl\`), subtle borders (\`border-slate-200\`), generous padding (\`p-6\`/\`p-8\`). Buttons: \`bg-indigo-600 text-white\` for the primary action, \`bg-slate-100\` for Back. Inputs use \`focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20\`.

## Accessibility

- Each field has an associated \`<label>\` (use \`htmlFor\`/\`for\` or a wrapping label).
- The required marker (\`*\`) is decorative — add \`aria-hidden="true"\`.
- Buttons are real \`<button type="button"/submit>\` elements; the form submits on Enter.
- Disabled state on Back uses \`disabled\` and \`disabled:opacity-30 disabled:pointer-events-none\`.

## Output

Return a single self-contained component file with no external dependencies beyond the framework runtime and Tailwind. Do not split across multiple files. Do not add a router or state library.`
}
