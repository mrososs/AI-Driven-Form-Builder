<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    modelValue?: boolean
    defaultOn?: boolean
  }>(),
  { defaultOn: false }
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const local = ref(props.defaultOn)

const isControlled = computed(() => props.modelValue !== undefined)
const checked = computed(() => (isControlled.value ? !!props.modelValue : local.value))

function toggle() {
  if (isControlled.value) {
    emit('update:modelValue', !props.modelValue)
  } else {
    local.value = !local.value
  }
}
</script>

<template>
  <button
    type="button"
    @click="toggle"
    :aria-pressed="checked"
    class="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-colors text-start"
  >
    <span class="text-[12px] text-slate-700 dark:text-white/70 leading-snug">{{ label }}</span>
    <span
      :class="[
        'shrink-0 relative rounded-full transition-colors duration-300',
        checked ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10',
      ]"
      style="width: 32px; height: 18px"
    >
      <span
        :class="[
          'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-300',
          checked ? 'start-[14px]' : 'start-0.5',
        ]"
        style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
      />
    </span>
  </button>
</template>
