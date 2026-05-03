<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { TourStep } from '../../composables/useTour'

const props = defineProps<{
  step: TourStep
  stepIndex: number
  totalSteps: number
}>()

const emit = defineEmits<{
  next: []
  prev: []
  end: []
}>()

const tooltipEl = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})
const spotlightStyle = ref<Record<string, string>>({})

function position() {
  const target = document.querySelector(props.step.target)
  if (!target || !tooltipEl.value) {
    tooltipStyle.value = { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }
    spotlightStyle.value = {}
    return
  }

  const tr = target.getBoundingClientRect()
  const tt = tooltipEl.value.getBoundingClientRect()
  const pad = 12
  const vw = window.innerWidth
  const vh = window.innerHeight

  // spotlight
  spotlightStyle.value = {
    top: `${tr.top - 6}px`,
    left: `${tr.left - 6}px`,
    width: `${tr.width + 12}px`,
    height: `${tr.height + 12}px`,
  }

  // tooltip placement
  const placement = props.step.placement ?? 'bottom'
  let top = 0, left = 0

  if (placement === 'bottom') {
    top = tr.bottom + pad
    left = tr.left + tr.width / 2 - tt.width / 2
  } else if (placement === 'top') {
    top = tr.top - tt.height - pad
    left = tr.left + tr.width / 2 - tt.width / 2
  } else if (placement === 'left') {
    top = tr.top + tr.height / 2 - tt.height / 2
    left = tr.left - tt.width - pad
  } else {
    top = tr.top + tr.height / 2 - tt.height / 2
    left = tr.right + pad
  }

  // clamp to viewport
  left = Math.max(pad, Math.min(left, vw - tt.width - pad))
  top = Math.max(pad, Math.min(top, vh - tt.height - pad))

  tooltipStyle.value = { top: `${top}px`, left: `${left}px` }
}

watch(
  () => [props.step, props.stepIndex],
  () => nextTick(position),
  { immediate: true, deep: true }
)

window.addEventListener('resize', position)
onUnmounted(() => window.removeEventListener('resize', position))
</script>

<template>
  <Teleport to="body">
    <!-- Dimmed overlay with spotlight cutout -->
    <div
      class="fixed inset-0 z-[9998] pointer-events-none"
      style="background: rgba(0,0,0,0.55)"
      aria-hidden="true"
    />
    <div
      v-if="spotlightStyle.width"
      class="fixed z-[9999] rounded-xl pointer-events-none ring-2 ring-indigo-400/60 ring-offset-0"
      :style="[spotlightStyle, { background: 'transparent', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }]"
      aria-hidden="true"
    />

    <!-- Tooltip card -->
    <div
      ref="tooltipEl"
      role="dialog"
      aria-modal="true"
      :aria-label="step.title"
      class="fixed z-[10000] w-72 rounded-2xl border border-white/[0.1] bg-[#1a1a28] shadow-2xl shadow-black/60 p-5"
      :style="tooltipStyle"
      style="transition: top 0.25s cubic-bezier(0.16,1,0.3,1), left 0.25s cubic-bezier(0.16,1,0.3,1)"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-400 mb-0.5">
            {{ stepIndex + 1 }} / {{ totalSteps }}
          </p>
          <h3 class="text-[14px] font-bold font-heading text-white leading-tight">{{ step.title }}</h3>
        </div>
        <button
          type="button"
          @click="emit('end')"
          class="shrink-0 p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close tour"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Body -->
      <p class="text-[12.5px] text-white/70 leading-relaxed mb-4" v-html="step.body" />

      <!-- Progress dots -->
      <div class="flex items-center gap-1 mb-4">
        <span
          v-for="i in totalSteps"
          :key="i"
          :class="[
            'h-1.5 rounded-full transition-all duration-300',
            i - 1 === stepIndex ? 'w-4 bg-indigo-400' : 'w-1.5 bg-white/20',
          ]"
        />
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          @click="emit('prev')"
          :disabled="stepIndex === 0"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft class="h-3 w-3" /> Back
        </button>
        <button
          type="button"
          @click="stepIndex === totalSteps - 1 ? emit('end') : emit('next')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          {{ stepIndex === totalSteps - 1 ? 'Done' : 'Next' }}
          <ChevronRight v-if="stepIndex < totalSteps - 1" class="h-3 w-3" />
        </button>
      </div>
    </div>
  </Teleport>
</template>
