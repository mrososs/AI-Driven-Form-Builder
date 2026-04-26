<script setup lang="ts">
import { computed } from 'vue'
import { Settings2, Trash2, GripVertical, ChevronDown, Calendar, Upload } from 'lucide-vue-next'
import type { MultiStepElement } from '../../../stores/multistepForm'
import { placeholderFor } from '../utils/catalog'

const props = defineProps<{
  element: MultiStepElement
  selected: boolean
}>()

const emit = defineEmits<{
  select: []
  remove: []
  update: [patch: Partial<MultiStepElement>]
}>()

const placeholder = computed(() => props.element.placeholder || placeholderFor(props.element.type))
</script>

<template>
  <div
    @click="emit('select')"
    :class="[
      'group relative rounded-xl border p-5 transition-all duration-200',
      selected
        ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/10 dark:border-indigo-500/50 dark:bg-[#13131a]'
        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md dark:border-white/[0.07] dark:bg-[#111118] dark:hover:border-indigo-500/30 dark:hover:shadow-black/30',
    ]"
    style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
  >
    <div
      class="hidden md:block absolute -start-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 dark:bg-[#111118] dark:border-white/[0.07] rounded-md p-1 shadow-md"
    >
      <GripVertical class="h-3.5 w-3.5 text-slate-400 dark:text-white/40" />
    </div>

    <div class="flex justify-between items-start mb-3 gap-2">
      <input
        :value="element.label"
        @click.stop
        @input="emit('update', { label: ($event.target as HTMLInputElement).value })"
        class="font-semibold text-slate-900 dark:text-white w-full bg-transparent border-none p-0 text-sm focus:outline-none"
      />
      <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          @click.stop="emit('select')"
          :class="[
            'p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
            selected
              ? 'text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-500/10'
              : 'text-slate-400 hover:text-indigo-600 dark:text-white/40 dark:hover:text-indigo-300',
          ]"
          aria-label="Edit field"
        >
          <Settings2 class="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          @click.stop="emit('remove')"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-white/40 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
          aria-label="Delete field"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <span
      v-if="element.required"
      class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 mb-2 me-1"
    >
      Required
    </span>

    <!-- Element preview -->
    <template v-if="element.type === 'otp'">
      <div class="flex gap-2">
        <div
          v-for="i in 6"
          :key="i"
          class="w-10 h-12 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 dark:border-white/[0.09] dark:bg-white/[0.04] dark:text-white/40 flex items-center justify-center font-mono font-semibold"
        >
          ·
        </div>
      </div>
    </template>

    <template v-else-if="element.type === 'textarea'">
      <div
        class="border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] text-slate-400 dark:text-white/30 text-sm h-20"
      >
        {{ placeholder }}
      </div>
    </template>

    <template v-else-if="element.type === 'select'">
      <div
        class="border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] flex justify-between items-center"
      >
        <span class="text-slate-400 dark:text-white/30 text-sm">Select an option</span>
        <ChevronDown class="h-3.5 w-3.5 text-slate-400 dark:text-white/30" />
      </div>
    </template>

    <template v-else-if="element.type === 'radio'">
      <div class="space-y-2">
        <div
          v-for="option in element.options || []"
          :key="option"
          class="flex items-center gap-3"
        >
          <div
            class="h-4 w-4 rounded-full border-2 border-slate-300 bg-white dark:border-white/20 dark:bg-white/[0.04] shrink-0"
          />
          <span class="text-slate-500 dark:text-white/50 text-sm">{{ option }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="element.type === 'checkbox'">
      <div class="flex items-center gap-3">
        <div
          class="h-4 w-4 rounded border-2 border-slate-300 bg-white dark:border-white/20 dark:bg-white/[0.04] shrink-0"
        />
        <span class="text-slate-500 dark:text-white/50 text-sm">{{ element.label }}</span>
      </div>
    </template>

    <template v-else-if="element.type === 'date'">
      <div
        class="border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] flex justify-between items-center"
      >
        <span class="text-slate-400 dark:text-white/30 text-sm">YYYY-MM-DD</span>
        <Calendar class="h-3.5 w-3.5 text-slate-400 dark:text-white/30" />
      </div>
    </template>

    <template v-else-if="element.type === 'file'">
      <div
        class="border border-dashed border-slate-300 dark:border-white/[0.12] rounded-lg px-3 py-4 bg-slate-50 dark:bg-white/[0.04] flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-white/40"
      >
        <Upload class="h-3.5 w-3.5" /> Click to upload
      </div>
    </template>

    <template v-else>
      <div
        class="border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] text-slate-400 dark:text-white/30 text-sm"
      >
        {{ placeholder }}
      </div>
    </template>
  </div>
</template>
