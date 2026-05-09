<script setup lang="ts">
import { computed } from 'vue'
import type { MultiStepElement, RangeUnit } from '../../../stores/multistepForm'
import {
  Mail,
  Phone,
  Calendar,
  CalendarRange,
  ChevronDown,
} from 'lucide-vue-next'

type FieldValue = string | string[]

const props = defineProps<{
  element: MultiStepElement
  modelValue: FieldValue
}>()

const emit = defineEmits<{ 'update:modelValue': [value: FieldValue] }>()

const stringValue = computed(() =>
  Array.isArray(props.modelValue) ? '' : (props.modelValue ?? ''),
)

const otpDigits = computed(() => {
  const v = stringValue.value
  return Array.from({ length: 6 }, (_, i) => v[i] ?? '')
})

function setOtpDigit(index: number, e: Event) {
  const target = e.target as HTMLInputElement
  const digit = target.value.replace(/\D/g, '').slice(0, 1)
  const next = otpDigits.value.slice()
  next[index] = digit
  emit('update:modelValue', next.join(''))
  if (digit) {
    const sibling = target.parentElement?.children[index + 1] as HTMLInputElement | undefined
    sibling?.focus()
  }
}

function inputType() {
  switch (props.element.type) {
    case 'email':
      return 'email'
    case 'number':
      return 'number'
    case 'phone':
      return 'tel'
    case 'password':
      return 'password'
    default:
      return 'text'
  }
}

const labelLeadIcon = computed(() => {
  switch (props.element.type) {
    case 'email':
      return Mail
    case 'phone':
      return Phone
    case 'date':
    case 'datetime':
    case 'time':
      return Calendar
    case 'daterange':
      return CalendarRange
    default:
      return null
  }
})

// ---- Stepper ----
const stepperValue = computed(() => {
  const raw = stringValue.value
  if (raw === '' || raw === null || raw === undefined) {
    return props.element.defaultValue ?? props.element.min ?? 0
  }
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return props.element.defaultValue ?? props.element.min ?? 0
  return parsed
})

function clampStep(v: number) {
  const min = props.element.min ?? 0
  const max = props.element.max ?? 99
  return Math.min(max, Math.max(min, v))
}

function bumpStepper(direction: 1 | -1) {
  const step = props.element.step ?? 1
  const next = clampStep(stepperValue.value + direction * step)
  emit('update:modelValue', String(next))
}

const stepperAtMin = computed(() => stepperValue.value <= (props.element.min ?? 0))
const stepperAtMax = computed(() => stepperValue.value >= (props.element.max ?? 99))

// ---- Date range ----
const rangeParts = computed(() => {
  const raw = stringValue.value
  const [start = '', end = ''] = raw.split('|')
  return { start, end }
})

function setRangeStart(value: string) {
  emit('update:modelValue', `${value}|${rangeParts.value.end}`)
}

function setRangeEnd(value: string) {
  emit('update:modelValue', `${rangeParts.value.start}|${value}`)
}

const UNIT_MS: Record<RangeUnit, number> = {
  hours: 3_600_000,
  days: 86_400_000,
  nights: 86_400_000,
  weeks: 7 * 86_400_000,
}

const rangeDelta = computed(() => {
  const { start, end } = rangeParts.value
  if (!start || !end) return null
  const a = Date.parse(start)
  const b = Date.parse(end)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null
  const unit = props.element.rangeUnit ?? 'days'
  const delta = Math.max(0, Math.round((b - a) / UNIT_MS[unit]))
  const label = delta === 1 ? unit.replace(/s$/, '') : unit
  return `${delta} ${label}`
})

// ---- Card groups (radiocards / checkboxcards) ----
const selectedValues = computed<string[]>(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue
  if (!props.modelValue) return []
  return [props.modelValue]
})

function isCardSelected(value: string) {
  return selectedValues.value.includes(value)
}

function toggleCheckboxCard(value: string) {
  const current = new Set(selectedValues.value)
  if (current.has(value)) current.delete(value)
  else current.add(value)
  emit('update:modelValue', Array.from(current))
}

function selectRadioCard(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="lf-field" :class="{ 'lf-full': element.type !== 'row' }">
    <!-- OTP -->
    <template v-if="element.type === 'otp'">
      <label class="lf-label">
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <div class="flex gap-2" dir="ltr">
        <input
          v-for="(d, i) in otpDigits"
          :key="i"
          :value="d"
          :maxlength="1"
          @input="setOtpDigit(i, $event)"
          class="lf-otp-cell"
          inputmode="numeric"
        />
      </div>
    </template>

    <!-- Textarea -->
    <template v-else-if="element.type === 'textarea'">
      <label class="lf-label">
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <textarea
        rows="3"
        :value="stringValue"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        :placeholder="element.placeholder"
        class="lf-textarea"
      />
    </template>

    <!-- Select -->
    <template v-else-if="element.type === 'select'">
      <label class="lf-label">
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <select
        :value="stringValue"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        class="lf-select"
      >
        <option value="">{{ element.placeholder || 'Select…' }}</option>
        <option
          v-for="o in element.options ?? []"
          :key="o"
          :value="o"
        >
          {{ o }}
        </option>
      </select>
    </template>

    <!-- Radio (row style) -->
    <template v-else-if="element.type === 'radio'">
      <label class="lf-label">
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <div class="lf-radio-list">
        <button
          v-for="o in element.options ?? []"
          :key="o"
          type="button"
          :class="['lf-radio-row', { 'is-selected': stringValue === o }]"
          @click="emit('update:modelValue', o)"
        >
          <span class="lf-radio-dot" />
          <span class="lf-radio-label">{{ o }}</span>
        </button>
      </div>
    </template>

    <!-- Checkbox (single, row style) -->
    <template v-else-if="element.type === 'checkbox'">
      <button
        type="button"
        :class="['lf-check-row', { 'is-checked': !!stringValue }]"
        @click="emit('update:modelValue', stringValue ? '' : 'true')"
      >
        <span class="lf-checkbox">
          <svg
            v-if="stringValue"
            width="11"
            height="11"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2 5l2 2 4-4.5" />
          </svg>
        </span>
        <span class="lf-check-label">
          {{ element.label }}
          <span v-if="element.required" class="lf-req">*</span>
        </span>
      </button>
    </template>

    <!-- Number stepper -->
    <template v-else-if="element.type === 'stepper'">
      <label class="lf-label">
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <div class="lf-stepper">
        <button
          type="button"
          :disabled="stepperAtMin"
          @click="bumpStepper(-1)"
          :aria-label="'Decrement ' + element.label"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          >
            <path d="M2.5 6h7" />
          </svg>
        </button>
        <div class="lf-stepper-value">{{ stepperValue }}</div>
        <button
          type="button"
          :disabled="stepperAtMax"
          @click="bumpStepper(1)"
          :aria-label="'Increment ' + element.label"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          >
            <path d="M6 2.5v7M2.5 6h7" />
          </svg>
        </button>
      </div>
    </template>

    <!-- Date range -->
    <template v-else-if="element.type === 'daterange'">
      <label class="lf-label">
        <CalendarRange v-if="labelLeadIcon" class="h-3.5 w-3.5 lf-label-icon" />
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <div class="lf-daterange">
        <CalendarRange class="h-4 w-4 lf-daterange-icon" />
        <input
          type="date"
          :value="rangeParts.start"
          @input="setRangeStart(($event.target as HTMLInputElement).value)"
          class="lf-daterange-input"
        />
        <span class="lf-daterange-divider rtl:rotate-180">→</span>
        <input
          type="date"
          :value="rangeParts.end"
          :min="rangeParts.start || undefined"
          @input="setRangeEnd(($event.target as HTMLInputElement).value)"
          class="lf-daterange-input"
        />
        <span v-if="rangeDelta" class="lf-daterange-delta">{{ rangeDelta }}</span>
      </div>
    </template>

    <!-- Date / time / datetime -->
    <template
      v-else-if="
        element.type === 'date' ||
        element.type === 'time' ||
        element.type === 'datetime'
      "
    >
      <label class="lf-label">
        <Calendar class="h-3.5 w-3.5 lf-label-icon" />
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <input
        :type="element.type === 'datetime' ? 'datetime-local' : element.type"
        :value="stringValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="element.placeholder"
        class="lf-input"
      />
    </template>

    <!-- File -->
    <template v-else-if="element.type === 'file'">
      <label class="lf-label">
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <input
        type="file"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).files?.[0]?.name ?? '')"
        class="lf-input"
      />
    </template>

    <!-- Radio cards -->
    <template v-else-if="element.type === 'radiocards'">
      <label class="lf-label">
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <div class="lf-radio-list">
        <button
          v-for="card in element.cards ?? []"
          :key="card.value"
          type="button"
          :class="['lf-radio-row', { 'is-selected': isCardSelected(card.value) }]"
          @click="selectRadioCard(card.value)"
        >
          <span class="lf-radio-dot" />
          <div class="lf-row-content">
            <div class="lf-row-title">{{ card.title }}</div>
            <div v-if="card.description" class="lf-row-sub">{{ card.description }}</div>
          </div>
          <div v-if="card.meta" class="lf-row-meta">{{ card.meta }}</div>
        </button>
      </div>
    </template>

    <!-- Checkbox cards -->
    <template v-else-if="element.type === 'checkboxcards'">
      <label class="lf-label">
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <div class="lf-check-list">
        <button
          v-for="card in element.cards ?? []"
          :key="card.value"
          type="button"
          :class="['lf-check-row', { 'is-checked': isCardSelected(card.value) }]"
          @click="toggleCheckboxCard(card.value)"
        >
          <span class="lf-checkbox">
            <svg
              v-if="isCardSelected(card.value)"
              width="11"
              height="11"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 5l2 2 4-4.5" />
            </svg>
          </span>
          <div class="lf-row-content">
            <div class="lf-row-title">{{ card.title }}</div>
            <div v-if="card.description" class="lf-row-sub">{{ card.description }}</div>
          </div>
          <div v-if="card.meta" class="lf-row-meta">{{ card.meta }}</div>
        </button>
      </div>
    </template>

    <!-- Default text-like input -->
    <template v-else>
      <label class="lf-label">
        <component
          v-if="labelLeadIcon"
          :is="labelLeadIcon"
          class="h-3.5 w-3.5 lf-label-icon"
        />
        {{ element.label }}
        <span v-if="element.required" class="lf-req">*</span>
      </label>
      <input
        :type="inputType()"
        :value="stringValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="element.placeholder"
        class="lf-input"
      />
    </template>
  </div>
</template>

<style scoped>
.lf-field {
  --lf-paper: #ffffff;
  --lf-ink: #0f172a;
  --lf-muted: #64748b;
  --lf-muted-2: #94a3b8;
  --lf-line: #e5e7eb;
  --lf-line-2: #eef0f4;
  --lf-primary: #6a4cff;
  --lf-primary-soft: #efeaff;
  --lf-warn: #dc2626;
  --lf-radius: 8px;

  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  color: var(--lf-ink);
  min-width: 0;
}

.lf-label {
  font-size: 13px;
  color: var(--lf-ink);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.lf-label-icon {
  color: var(--lf-muted);
}

.lf-req {
  color: var(--lf-warn);
}

.lf-input,
.lf-textarea,
.lf-select {
  width: 100%;
  border: 1px solid var(--lf-line);
  background: var(--lf-paper);
  border-radius: var(--lf-radius);
  padding: 11px 14px;
  font-size: 14px;
  color: var(--lf-ink);
  font-family: inherit;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.lf-input:focus,
.lf-textarea:focus,
.lf-select:focus {
  outline: none;
  border-color: var(--lf-primary);
  box-shadow: 0 0 0 3px var(--lf-primary-soft);
}

.lf-input::placeholder,
.lf-textarea::placeholder {
  color: var(--lf-muted-2);
}

.lf-textarea {
  resize: vertical;
  min-height: 88px;
}

.lf-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 4.5l3 3 3-3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}

[dir='rtl'] .lf-select {
  background-position: left 14px center;
  padding-right: 14px;
  padding-left: 36px;
}

.lf-otp-cell {
  width: 44px;
  height: 48px;
  border: 1px solid var(--lf-line);
  background: var(--lf-paper);
  color: var(--lf-ink);
  border-radius: var(--lf-radius);
  text-align: center;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 18px;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;
}
.lf-otp-cell:focus {
  outline: none;
  border-color: var(--lf-primary);
  box-shadow: 0 0 0 3px var(--lf-primary-soft);
}

.lf-radio-list,
.lf-check-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lf-radio-row,
.lf-check-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--lf-line);
  border-radius: var(--lf-radius);
  background: var(--lf-paper);
  cursor: pointer;
  width: 100%;
  text-align: start;
  font-family: inherit;
  color: inherit;
  transition:
    border-color 120ms ease,
    background-color 120ms ease,
    box-shadow 120ms ease;
}
.lf-radio-row:hover,
.lf-check-row:hover {
  border-color: var(--lf-muted);
}
.lf-radio-row.is-selected {
  border-color: var(--lf-primary);
  background: #fafaff;
  box-shadow: 0 0 0 1px var(--lf-primary) inset;
}
.lf-check-row.is-checked {
  border-color: var(--lf-primary);
  background: #fafaff;
}

.lf-radio-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--lf-line);
  background: var(--lf-paper);
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.lf-radio-row.is-selected .lf-radio-dot {
  border-color: var(--lf-primary);
}
.lf-radio-row.is-selected .lf-radio-dot::after {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--lf-primary);
  border-radius: 50%;
}

.lf-checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--lf-line);
  background: var(--lf-paper);
  color: var(--lf-paper);
  border-radius: 4px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 120ms ease,
    border-color 120ms ease;
}
.lf-check-row.is-checked .lf-checkbox {
  background: var(--lf-primary);
  border-color: var(--lf-primary);
}

.lf-radio-label,
.lf-check-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--lf-ink);
}

.lf-row-content {
  flex: 1;
  min-width: 0;
}
.lf-row-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--lf-ink);
}
.lf-row-sub {
  font-size: 12px;
  color: var(--lf-muted);
  margin-top: 1px;
}
.lf-row-meta {
  font-size: 13px;
  font-weight: 600;
  color: var(--lf-ink);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  margin-inline-start: 8px;
}

.lf-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--lf-line);
  border-radius: var(--lf-radius);
  background: var(--lf-paper);
  width: 100%;
  height: 44px;
}
.lf-stepper button {
  width: 42px;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--lf-ink);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 120ms ease;
}
.lf-stepper button:hover:not(:disabled) {
  background: var(--lf-line-2);
}
.lf-stepper button:disabled {
  color: var(--lf-muted-2);
  cursor: not-allowed;
}
.lf-stepper-value {
  flex: 1;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-size: 14px;
  font-weight: 600;
  border-inline-start: 1px solid var(--lf-line);
  border-inline-end: 1px solid var(--lf-line);
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lf-daterange {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--lf-line);
  background: var(--lf-paper);
  border-radius: var(--lf-radius);
  padding: 8px 14px;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;
}
.lf-daterange:focus-within {
  border-color: var(--lf-primary);
  box-shadow: 0 0 0 3px var(--lf-primary-soft);
}
.lf-daterange-icon {
  color: var(--lf-muted);
  flex-shrink: 0;
}
.lf-daterange-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  font-size: 14px;
  color: var(--lf-ink);
  font-family: inherit;
  padding: 4px 0;
}
.lf-daterange-input:focus {
  outline: none;
}
.lf-daterange-divider {
  color: var(--lf-muted-2);
  font-size: 14px;
}
.lf-daterange-delta {
  font-size: 12px;
  font-weight: 600;
  color: var(--lf-primary);
  white-space: nowrap;
  margin-inline-start: 4px;
}
</style>
