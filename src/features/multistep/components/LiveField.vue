<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MultiStepElement, RangeUnit } from '../../../stores/multistepForm'
import { Minus, Plus } from 'lucide-vue-next'

type FieldValue = string | string[]

const props = defineProps<{
  element: MultiStepElement
  modelValue: FieldValue
}>()

const emit = defineEmits<{ 'update:modelValue': [value: FieldValue] }>()

const focused = ref(false)

const inputClass = computed(() => [
  'w-full border rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] transition-all focus:outline-none',
  focused.value
    ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-500/60'
    : 'border-slate-200 dark:border-white/[0.07]',
])

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
  <div>
    <template v-if="element.type === 'otp'">
      <label class="block text-[12px] font-semibold text-slate-700 dark:text-white/70 mb-1.5">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
      </label>
      <div class="flex gap-2" dir="ltr">
        <input
          v-for="(d, i) in otpDigits"
          :key="i"
          :value="d"
          :maxlength="1"
          @input="setOtpDigit(i, $event)"
          class="w-11 h-12 rounded-lg border border-slate-200 bg-white text-slate-900 dark:border-white/[0.09] dark:bg-white/[0.04] dark:text-white text-center font-mono text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          inputmode="numeric"
        />
      </div>
      <p class="mt-2 text-[11px] text-slate-500 dark:text-white/40">
        Didn't get a code?
        <a class="text-indigo-700 dark:text-indigo-300 font-medium cursor-pointer">Resend</a>
      </p>
    </template>

    <template v-else-if="element.type === 'textarea'">
      <label class="block text-[12px] font-semibold text-slate-700 dark:text-white/70 mb-1.5">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
      </label>
      <textarea
        rows="3"
        :value="stringValue"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @focus="focused = true"
        @blur="focused = false"
        :placeholder="element.placeholder"
        :class="[...inputClass, 'resize-none']"
      />
    </template>

    <template v-else-if="element.type === 'select'">
      <label class="block text-[12px] font-semibold text-slate-700 dark:text-white/70 mb-1.5">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
      </label>
      <select
        :value="stringValue"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        :class="[...inputClass, 'appearance-none']"
      >
        <option value="" class="bg-white dark:bg-[#111118]">Select…</option>
        <option
          v-for="o in element.options ?? []"
          :key="o"
          :value="o"
          class="bg-white dark:bg-[#111118]"
        >
          {{ o }}
        </option>
      </select>
    </template>

    <template v-else-if="element.type === 'radio'">
      <label class="block text-[12px] font-semibold text-slate-700 dark:text-white/70 mb-1.5">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
      </label>
      <div class="space-y-2">
        <label
          v-for="o in element.options ?? []"
          :key="o"
          :class="[
            'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
            stringValue === o
              ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-500/[0.08]'
              : 'border-slate-200 hover:border-slate-300 bg-white dark:border-white/[0.07] dark:hover:border-white/15 dark:bg-white/[0.02]',
          ]"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <span
            :class="[
              'w-4 h-4 rounded-full border-2 shrink-0 relative',
              stringValue === o
                ? 'border-indigo-500 dark:border-indigo-400'
                : 'border-slate-300 dark:border-white/20',
            ]"
          >
            <span
              v-if="stringValue === o"
              class="absolute inset-1 rounded-full bg-indigo-500 dark:bg-indigo-400"
            />
          </span>
          <input
            type="radio"
            :checked="stringValue === o"
            @change="emit('update:modelValue', o)"
            class="sr-only"
          />
          <span class="text-sm text-slate-800 dark:text-white/80">{{ o }}</span>
        </label>
      </div>
    </template>

    <template v-else-if="element.type === 'checkbox'">
      <label
        class="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white dark:border-white/[0.07] dark:hover:border-white/15 dark:bg-white/[0.02] cursor-pointer"
      >
        <input
          type="checkbox"
          :checked="!!stringValue"
          @change="
            emit('update:modelValue', ($event.target as HTMLInputElement).checked ? 'true' : '')
          "
          class="mt-0.5 h-4 w-4 text-indigo-600 rounded border-slate-300 bg-white dark:border-white/20 dark:bg-transparent"
        />
        <span class="text-sm text-slate-800 dark:text-white/80">
          {{ element.label }}
          <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
        </span>
      </label>
    </template>

    <template v-else-if="element.type === 'stepper'">
      <label class="block text-[12px] font-semibold text-slate-700 dark:text-white/70 mb-1.5">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
      </label>
      <div
        class="flex items-stretch border border-slate-200 dark:border-white/[0.07] rounded-lg overflow-hidden bg-white dark:bg-white/[0.03]"
      >
        <button
          type="button"
          :disabled="stepperAtMin"
          @click="bumpStepper(-1)"
          class="px-4 flex items-center justify-center text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.05] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          :aria-label="'Decrement ' + element.label"
        >
          <Minus class="h-4 w-4" />
        </button>
        <input
          type="number"
          :value="stepperValue"
          :min="element.min"
          :max="element.max"
          :step="element.step"
          @input="emit('update:modelValue', String(clampStep(Number(($event.target as HTMLInputElement).value))))"
          class="flex-1 min-w-0 text-center text-sm font-medium text-slate-900 dark:text-white bg-transparent border-x border-slate-200 dark:border-white/[0.07] focus:outline-none focus:bg-slate-50 dark:focus:bg-white/[0.04] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          :disabled="stepperAtMax"
          @click="bumpStepper(1)"
          class="px-4 flex items-center justify-center text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.05] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          :aria-label="'Increment ' + element.label"
        >
          <Plus class="h-4 w-4" />
        </button>
      </div>
    </template>

    <template v-else-if="element.type === 'daterange'">
      <label class="block text-[12px] font-semibold text-slate-700 dark:text-white/70 mb-1.5">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
      </label>
      <div
        class="flex items-center gap-2 border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 bg-white dark:bg-white/[0.03]"
      >
        <input
          type="date"
          :value="rangeParts.start"
          @input="setRangeStart(($event.target as HTMLInputElement).value)"
          class="flex-1 min-w-0 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
        />
        <span class="text-slate-400 dark:text-white/30 text-sm rtl:rotate-180">→</span>
        <input
          type="date"
          :value="rangeParts.end"
          :min="rangeParts.start || undefined"
          @input="setRangeEnd(($event.target as HTMLInputElement).value)"
          class="flex-1 min-w-0 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
        />
        <span
          v-if="rangeDelta"
          class="text-[12px] font-medium text-indigo-600 dark:text-indigo-300 ms-2 shrink-0"
        >
          {{ rangeDelta }}
        </span>
      </div>
    </template>

    <template v-else-if="element.type === 'radiocards'">
      <label class="block text-[12px] font-semibold text-slate-700 dark:text-white/70 mb-1.5">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
      </label>
      <div class="space-y-2">
        <label
          v-for="card in element.cards ?? []"
          :key="card.value"
          :class="[
            'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
            isCardSelected(card.value)
              ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-500/[0.08]'
              : 'border-slate-200 hover:border-slate-300 bg-white dark:border-white/[0.07] dark:hover:border-white/15 dark:bg-white/[0.02]',
          ]"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <span
            :class="[
              'w-4 h-4 rounded-full border-2 shrink-0 relative',
              isCardSelected(card.value)
                ? 'border-indigo-500 dark:border-indigo-400'
                : 'border-slate-300 dark:border-white/20',
            ]"
          >
            <span
              v-if="isCardSelected(card.value)"
              class="absolute inset-1 rounded-full bg-indigo-500 dark:bg-indigo-400"
            />
          </span>
          <input
            type="radio"
            :checked="isCardSelected(card.value)"
            @change="selectRadioCard(card.value)"
            class="sr-only"
          />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ card.title }}</div>
            <div
              v-if="card.description"
              class="text-[12px] text-slate-500 dark:text-white/50 truncate"
            >
              {{ card.description }}
            </div>
          </div>
          <div
            v-if="card.meta"
            class="text-sm font-medium text-slate-700 dark:text-white/80 shrink-0 ms-3"
          >
            {{ card.meta }}
          </div>
        </label>
      </div>
    </template>

    <template v-else-if="element.type === 'checkboxcards'">
      <label class="block text-[12px] font-semibold text-slate-700 dark:text-white/70 mb-1.5">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
      </label>
      <div class="space-y-2">
        <label
          v-for="card in element.cards ?? []"
          :key="card.value"
          :class="[
            'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
            isCardSelected(card.value)
              ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-500/[0.08]'
              : 'border-slate-200 hover:border-slate-300 bg-white dark:border-white/[0.07] dark:hover:border-white/15 dark:bg-white/[0.02]',
          ]"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <span
            :class="[
              'w-4 h-4 rounded shrink-0 flex items-center justify-center border',
              isCardSelected(card.value)
                ? 'bg-indigo-500 border-indigo-500 dark:bg-indigo-400 dark:border-indigo-400'
                : 'bg-white border-slate-300 dark:bg-white/[0.05] dark:border-white/20',
            ]"
          >
            <svg
              v-if="isCardSelected(card.value)"
              class="w-3 h-3 text-white"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="2.5,6.5 5,9 9.5,3.5" />
            </svg>
          </span>
          <input
            type="checkbox"
            :checked="isCardSelected(card.value)"
            @change="toggleCheckboxCard(card.value)"
            class="sr-only"
          />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ card.title }}</div>
            <div
              v-if="card.description"
              class="text-[12px] text-slate-500 dark:text-white/50 truncate"
            >
              {{ card.description }}
            </div>
          </div>
          <div
            v-if="card.meta"
            class="text-sm font-medium text-slate-700 dark:text-white/80 shrink-0 ms-3"
          >
            {{ card.meta }}
          </div>
        </label>
      </div>
    </template>

    <template v-else>
      <label class="block text-[12px] font-semibold text-slate-700 dark:text-white/70 mb-1.5">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
      </label>
      <input
        :type="inputType()"
        :value="stringValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="focused = true"
        @blur="focused = false"
        :placeholder="element.placeholder"
        :class="inputClass"
      />
    </template>
  </div>
</template>
