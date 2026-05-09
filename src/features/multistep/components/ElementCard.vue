<script setup lang="ts">
import { computed } from 'vue'
import { Settings2, Trash2, GripVertical, ChevronDown, Calendar, CalendarRange, Upload, Minus, Plus } from 'lucide-vue-next'
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
        ? 'border-[#6A4CFF] bg-[#FAFAFF] shadow-lg shadow-[#6A4CFF]/10 dark:border-[#6A4CFF]/60 dark:bg-[#13131a]'
        : 'border-slate-200 bg-white hover:border-[#6A4CFF]/40 hover:shadow-md dark:border-white/[0.07] dark:bg-[#111118] dark:hover:border-[#6A4CFF]/40 dark:hover:shadow-black/30',
    ]"
    style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
  >
    <div
      class="hidden md:block absolute -start-3 top-1/2 -translate-y-1/2 drag-handle cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 dark:bg-[#111118] dark:border-white/[0.07] rounded-md p-1 shadow-md"
      aria-label="Drag to reorder"
    >
      <GripVertical class="h-3.5 w-3.5 text-slate-400 dark:text-white/40" />
    </div>

    <div class="flex justify-between items-start mb-3 gap-2">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span
          class="md:hidden drag-handle cursor-grab active:cursor-grabbing p-1 -ms-1 text-slate-400 dark:text-white/30 shrink-0"
          aria-label="Drag to reorder"
          @click.stop
        >
          <GripVertical class="h-4 w-4" aria-hidden="true" />
        </span>
        <input
          :value="element.label"
          @click.stop
          @input="emit('update', { label: ($event.target as HTMLInputElement).value })"
          class="font-semibold text-slate-900 dark:text-white w-full bg-transparent border-none p-0 text-sm focus:outline-none"
        />
      </div>
      <div class="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          @click.stop="emit('select')"
          :class="[
            'p-2 md:p-1.5 rounded-lg hover:bg-[#EFEAFF] dark:hover:bg-[#6A4CFF]/15',
            selected
              ? 'text-[#4B33C7] bg-[#EFEAFF] dark:text-[#bdb1ff] dark:bg-[#6A4CFF]/15'
              : 'text-slate-500 hover:text-[#4B33C7] dark:text-white/50 dark:hover:text-[#bdb1ff]',
          ]"
          aria-label="Edit field"
        >
          <Settings2 class="h-4 w-4 md:h-3.5 md:w-3.5" />
        </button>
        <button
          type="button"
          @click.stop="emit('remove')"
          class="p-2 md:p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-white/50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
          aria-label="Delete field"
        >
          <Trash2 class="h-4 w-4 md:h-3.5 md:w-3.5" />
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

    <template v-else-if="element.type === 'stepper'">
      <div
        class="flex items-stretch border border-slate-200 dark:border-white/[0.07] rounded-lg overflow-hidden bg-slate-50 dark:bg-white/[0.04]"
      >
        <div class="px-4 flex items-center justify-center text-slate-400 dark:text-white/40">
          <Minus class="h-3.5 w-3.5" />
        </div>
        <div
          class="flex-1 text-center text-sm font-medium text-slate-500 dark:text-white/50 py-2 border-x border-slate-200 dark:border-white/[0.07]"
        >
          {{ element.defaultValue ?? element.min ?? 0 }}
        </div>
        <div class="px-4 flex items-center justify-center text-slate-400 dark:text-white/40">
          <Plus class="h-3.5 w-3.5" />
        </div>
      </div>
    </template>

    <template v-else-if="element.type === 'daterange'">
      <div
        class="flex items-center gap-2 border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04]"
      >
        <CalendarRange class="h-3.5 w-3.5 text-slate-400 dark:text-white/30 shrink-0" />
        <span class="text-slate-400 dark:text-white/30 text-sm flex-1">Start date</span>
        <span class="text-slate-300 dark:text-white/20 text-sm rtl:rotate-180">→</span>
        <span class="text-slate-400 dark:text-white/30 text-sm flex-1">End date</span>
        <span class="text-[11px] text-indigo-600 dark:text-indigo-300 font-medium ms-2 shrink-0">
          {{ element.rangeUnit ?? 'days' }}
        </span>
      </div>
    </template>

    <template v-else-if="element.type === 'radiocards'">
      <div class="space-y-2">
        <div
          v-for="card in element.cards ?? []"
          :key="card.value"
          class="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02]"
        >
          <div
            class="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.05] shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-700 dark:text-white/80 truncate">{{ card.title }}</div>
            <div
              v-if="card.description"
              class="text-[12px] text-slate-500 dark:text-white/40 truncate"
            >
              {{ card.description }}
            </div>
          </div>
          <div
            v-if="card.meta"
            class="text-sm font-medium text-slate-600 dark:text-white/60 shrink-0 ms-2"
          >
            {{ card.meta }}
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="element.type === 'checkboxcards'">
      <div class="space-y-2">
        <div
          v-for="card in element.cards ?? []"
          :key="card.value"
          class="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02]"
        >
          <div
            class="h-4 w-4 rounded border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.05] shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-700 dark:text-white/80 truncate">{{ card.title }}</div>
            <div
              v-if="card.description"
              class="text-[12px] text-slate-500 dark:text-white/40 truncate"
            >
              {{ card.description }}
            </div>
          </div>
          <div
            v-if="card.meta"
            class="text-sm font-medium text-slate-600 dark:text-white/60 shrink-0 ms-2"
          >
            {{ card.meta }}
          </div>
        </div>
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
