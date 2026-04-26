<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MultiStepElement } from '../../../stores/multistepForm'

const props = defineProps<{
  element: MultiStepElement
  modelValue: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const focused = ref(false)

const inputClass = computed(() => [
  'w-full border rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-white dark:bg-white/[0.03] transition-all focus:outline-none',
  focused.value
    ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-500/60'
    : 'border-slate-200 dark:border-white/[0.07]',
])

const otpDigits = computed(() => {
  const v = props.modelValue ?? ''
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
    default:
      return 'text'
  }
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
        :value="modelValue"
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
        :value="modelValue"
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
            modelValue === o
              ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-500/[0.08]'
              : 'border-slate-200 hover:border-slate-300 bg-white dark:border-white/[0.07] dark:hover:border-white/15 dark:bg-white/[0.02]',
          ]"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <span
            :class="[
              'w-4 h-4 rounded-full border-2 shrink-0 relative',
              modelValue === o
                ? 'border-indigo-500 dark:border-indigo-400'
                : 'border-slate-300 dark:border-white/20',
            ]"
          >
            <span
              v-if="modelValue === o"
              class="absolute inset-1 rounded-full bg-indigo-500 dark:bg-indigo-400"
            />
          </span>
          <input
            type="radio"
            :checked="modelValue === o"
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
          :checked="!!modelValue"
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

    <template v-else>
      <label class="block text-[12px] font-semibold text-slate-700 dark:text-white/70 mb-1.5">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ms-1">*</span>
      </label>
      <input
        :type="inputType()"
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="focused = true"
        @blur="focused = false"
        :placeholder="element.placeholder"
        :class="inputClass"
      />
    </template>
  </div>
</template>
