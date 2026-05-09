<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { ChevronLeft, ChevronRight, Plus, Layers } from 'lucide-vue-next'
import { useMultiStepFormStore } from '../../../stores/multistepForm'
import { STEP_ICONS } from '../utils/icons'
import ElementCard from './ElementCard.vue'
import MultiStepRowCard from './MultiStepRowCard.vue'

const store = useMultiStepFormStore()

const step = computed(() => store.activeStep)
const stepIndex = computed(() => store.activeStepIndex)
const total = computed(() => store.steps.length)

const stepIcon = computed(() => (step.value ? STEP_ICONS[step.value.icon] : null))

function prev() {
  const target = store.steps[stepIndex.value - 1]
  if (target) store.selectStep(target.id)
}

function next() {
  const target = store.steps[stepIndex.value + 1]
  if (target) store.selectStep(target.id)
}

function insertAfter() {
  store.addStep(stepIndex.value)
}

function onElementAdded(event: { newIndex: number }) {
  const dropped = step.value?.elements[event.newIndex]
  if (dropped) store.selectElement(dropped.id)
}
</script>

<template>
  <main class="flex-1 min-w-0 flex flex-col">
    <!-- Sub-toolbar -->
    <div
      class="h-14 shrink-0 flex items-center gap-3 px-4 sm:px-6 border-b border-slate-200 dark:border-white/[0.05] bg-slate-100 dark:bg-[#0d0d14]"
    >
      <button
        type="button"
        :disabled="stepIndex <= 0"
        @click="prev"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/[0.07] disabled:opacity-30 disabled:pointer-events-none"
        :aria-label="'Previous step'"
      >
        <ChevronLeft class="h-4 w-4 rtl:rotate-180" />
      </button>
      <div class="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.07]">
        <div
          class="h-full rounded-full bg-[#6A4CFF]"
          :style="{ width: `${total > 0 ? ((stepIndex + 1) / total) * 100 : 0}%` }"
          style="transition: width 600ms cubic-bezier(0.2, 0.7, 0.2, 1)"
        />
      </div>
      <span class="text-[12px] font-medium tabular-nums text-slate-500 dark:text-white/60">
        Step <span class="text-slate-900 dark:text-white">{{ stepIndex + 1 }}</span
        >/<span>{{ total }}</span>
      </span>
      <button
        type="button"
        :disabled="stepIndex >= total - 1"
        @click="next"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/[0.07] disabled:opacity-30 disabled:pointer-events-none"
        :aria-label="'Next step'"
      >
        <ChevronRight class="h-4 w-4 rtl:rotate-180" />
      </button>
    </div>

    <!-- Canvas content -->
    <div
      v-if="step"
      :key="step.id"
      class="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 lg:p-8 xl:p-12 flex justify-center bg-slate-100 dark:bg-[#0d0d14]"
    >
      <div class="w-full max-w-2xl space-y-4 ms-step-enter">
        <!-- Step header card -->
        <div class="rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111118] p-5 sm:p-6 xl:p-8 shadow-sm dark:shadow-none">
          <div class="flex items-center mb-3">
            <div
              class="w-9 h-9 rounded-[10px] bg-[#EFEAFF] dark:bg-[#6A4CFF]/15 flex items-center justify-center text-[#6A4CFF] dark:text-[#a99cff]"
            >
              <component :is="stepIcon" class="h-[18px] w-[18px]" />
            </div>
            <span
              class="ms-3 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-500 dark:text-white/50 uppercase tracking-[0.08em] border border-slate-200 dark:border-white/[0.06]"
            >
              Step {{ stepIndex + 1 }} of {{ total }}
            </span>
          </div>
          <input
            :value="step.title"
            @input="store.updateStep(step.id, { title: ($event.target as HTMLInputElement).value })"
            class="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white w-full bg-transparent border-none p-0 mb-1 placeholder:text-slate-300 dark:placeholder:text-white/20 focus:outline-none"
            placeholder="Step title"
          />
          <textarea
            :value="step.description"
            @input="store.updateStep(step.id, { description: ($event.target as HTMLTextAreaElement).value })"
            rows="1"
            class="text-slate-500 dark:text-white/50 w-full bg-transparent border-none p-0 resize-none text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none"
            placeholder="Describe this step…"
          />
        </div>

        <!-- Elements -->
        <draggable
          :list="step.elements"
          item-key="id"
          :group="{ name: 'multistep-canvas', put: true }"
          handle=".drag-handle"
          :delay="150"
          :delay-on-touch-only="true"
          :touch-start-threshold="5"
          ghost-class="ms-drag-ghost"
          class="space-y-4 min-h-[60px]"
          @add="onElementAdded"
        >
          <template #item="{ element: el }">
            <MultiStepRowCard
              v-if="el.type === 'row'"
              :element="el"
              :selected="store.selectedElementId === el.id"
              @select="store.selectElement(el.id)"
              @remove="store.removeElement(el.id)"
            />
            <ElementCard
              v-else
              :element="el"
              :selected="store.selectedElementId === el.id"
              @select="store.selectElement(el.id)"
              @remove="store.removeElement(el.id)"
              @update="patch => store.updateElement(el.id, patch)"
            />
          </template>
          <template #footer>
            <div
              v-if="step.elements.length === 0"
              class="rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/[0.08] p-14 text-center bg-white/50 dark:bg-transparent"
            >
              <div
                class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center mx-auto mb-4 ring-1 ring-slate-200 dark:ring-white/[0.06]"
              >
                <Layers class="h-[18px] w-[18px] text-slate-500 dark:text-white/40" />
              </div>
              <p class="text-slate-700 dark:text-white/70 font-semibold text-sm mb-1">This step is empty</p>
              <p class="text-slate-500 dark:text-white/40 text-sm">
                Drag an element from the sidebar, tap one, or let AI suggest fields for this step.
              </p>
            </div>
          </template>
        </draggable>

        <!-- Bottom: step navigation -->
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-dashed border-slate-200 dark:border-white/[0.07]"
        >
          <p class="text-[11px] text-slate-500 dark:text-white/30 font-medium">
            Respondents will see
            <span class="text-slate-700 dark:text-white/60">Back / Continue</span> buttons.
          </p>
          <button
            type="button"
            @click="insertAfter"
            class="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#4B33C7] dark:text-[#bdb1ff] bg-[#EFEAFF] dark:bg-[#6A4CFF]/15 hover:bg-[#e3dcff] dark:hover:bg-[#6A4CFF]/25 transition-colors whitespace-nowrap"
            style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
          >
            <Plus class="h-3 w-3" /> Insert step after this
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.ms-step-enter {
  animation: ms-step-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes ms-step-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ms-step-enter {
    animation: none;
  }
}

:deep(.drag-handle) {
  touch-action: none;
}

.ms-drag-ghost {
  opacity: 0.4;
}
</style>
