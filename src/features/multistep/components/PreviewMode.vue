<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Check, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useMultiStepFormStore } from '../../../stores/multistepForm'
import { STEP_ICONS } from '../utils/icons'
import LiveField from './LiveField.vue'

const emit = defineEmits<{ exit: [] }>()

const store = useMultiStepFormStore()

const idx = ref(0)
const done = ref(false)
const values = reactive<Record<string, string | string[]>>({})

const step = computed(() => store.steps[idx.value] ?? null)
const stepIcon = computed(() => (step.value ? STEP_ICONS[step.value.icon] : null))

function goNext() {
  if (idx.value < store.steps.length - 1) {
    idx.value++
  } else {
    done.value = true
  }
}

function goBack() {
  if (idx.value > 0) idx.value--
}

function restart() {
  done.value = false
  idx.value = 0
  for (const key in values) delete values[key]
}
</script>

<template>
  <div class="flex-1 min-h-0 flex">
    <div
      v-if="store.steps.length === 0"
      class="flex-1 min-w-0 flex items-center justify-center p-6 sm:p-10"
    >
      <div class="max-w-md text-center">
        <div class="flex items-center justify-between mb-6">
          <button
            type="button"
            @click="emit('exit')"
            class="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-white/40 dark:hover:text-white/80 transition-colors"
          >
            <ChevronLeft class="h-3.5 w-3.5 rtl:rotate-180" /> Back to builder
          </button>
        </div>
        <p class="text-slate-500 dark:text-white/40 text-sm leading-relaxed">
          Add at least one step in the builder to preview the respondent flow.
        </p>
      </div>
    </div>

    <aside
      v-else-if="store.progressStyle === 'sidebar' && !done"
      class="w-72 shrink-0 border-e border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0c0c12] p-6"
    >
      <p class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em] mb-4">
        Registration
      </p>
      <ol class="space-y-1">
        <li
          v-for="(s, i) in store.steps"
          :key="s.id"
          :class="[
            'flex items-center gap-3 p-2.5 rounded-lg transition-all',
            i === idx
              ? 'bg-indigo-50 border border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30'
              : 'border border-transparent',
          ]"
          style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <div
            :class="[
              'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
              i < idx
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/30'
                : i === idx
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white ring-1 ring-white/20'
                  : 'bg-white text-slate-400 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:text-white/40 dark:ring-white/[0.06]',
            ]"
          >
            <Check v-if="i < idx" class="h-3 w-3" />
            <component :is="STEP_ICONS[s.icon]" v-else class="h-3 w-3" />
          </div>
          <div class="min-w-0">
            <p
              :class="[
                'text-[13px] font-semibold truncate',
                i === idx
                  ? 'text-slate-900 dark:text-white'
                  : i < idx
                    ? 'text-slate-600 dark:text-white/60'
                    : 'text-slate-400 dark:text-white/40',
              ]"
            >
              {{ s.title }}
            </p>
            <p class="text-[11px] text-slate-400 dark:text-white/30 tabular-nums">
              Step {{ String(i + 1).padStart(2, '0') }}
            </p>
          </div>
        </li>
      </ol>
    </aside>

    <div
      v-if="store.steps.length > 0"
      class="flex-1 min-w-0 flex items-center justify-center p-6 sm:p-10 overflow-y-auto scrollbar-thin"
    >
      <div class="w-full max-w-xl">
        <div class="flex items-center justify-between mb-6">
          <button
            type="button"
            @click="emit('exit')"
            class="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-white/40 dark:hover:text-white/80 transition-colors"
          >
            <ChevronLeft class="h-3.5 w-3.5 rtl:rotate-180" /> Back to builder
          </button>
          <span class="text-[11px] text-slate-400 dark:text-white/30 font-semibold uppercase tracking-wider">
            Respondent view
          </span>
        </div>

        <div
          v-if="!done && step"
          :key="step.id"
          class="rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111118] p-8 shadow-sm dark:shadow-none ms-fade-up"
        >
          <!-- Numbered progress -->
          <div
            v-if="store.progressStyle === 'numbered'"
            class="flex items-center gap-2 mb-6"
          >
            <div
              v-for="(_, i) in store.steps"
              :key="i"
              class="flex items-center gap-2 flex-1"
            >
              <div
                :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold tabular-nums transition-all',
                  i < idx
                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/30'
                    : i === idx
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white ring-1 ring-white/20'
                      : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:text-white/40 dark:ring-white/[0.06]',
                ]"
              >
                <Check v-if="i < idx" class="h-2.5 w-2.5" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <div
                v-if="i < store.steps.length - 1"
                :class="[
                  'h-0.5 flex-1 rounded transition-all',
                  i < idx
                    ? 'bg-emerald-300 dark:bg-emerald-500/40'
                    : 'bg-slate-200 dark:bg-white/[0.07]',
                ]"
              />
            </div>
          </div>

          <!-- Bar -->
          <div v-else-if="store.progressStyle === 'bar'" class="mb-6">
            <div class="h-1 rounded-full bg-slate-200 dark:bg-white/[0.07] overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                :style="{ width: `${((idx + 1) / store.steps.length) * 100}%` }"
                style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
              />
            </div>
            <p class="text-[11px] text-slate-500 dark:text-white/40 mt-2 tabular-nums">
              Step {{ idx + 1 }} of {{ store.steps.length }}
            </p>
          </div>

          <!-- Dots -->
          <div
            v-else-if="store.progressStyle === 'dots'"
            class="flex items-center justify-center gap-2 mb-6"
          >
            <div
              v-for="(_, i) in store.steps"
              :key="i"
              :class="[
                'rounded-full transition-all',
                i === idx
                  ? 'w-6 h-1.5 bg-indigo-500 dark:bg-indigo-400'
                  : i < idx
                    ? 'w-1.5 h-1.5 bg-emerald-400/70'
                    : 'w-1.5 h-1.5 bg-slate-200 dark:bg-white/10',
              ]"
            />
          </div>

          <!-- Step header -->
          <div class="flex items-center gap-3 mb-1">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-50 border border-indigo-200 dark:from-indigo-500/30 dark:to-violet-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300"
            >
              <component :is="stepIcon" class="h-4 w-4" />
            </div>
            <span
              class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em]"
            >
              Step {{ idx + 1 }} of {{ store.steps.length }}
            </span>
          </div>
          <h1 class="font-heading font-bold text-2xl text-slate-900 dark:text-white mb-1">
            {{ step.title }}
          </h1>
          <p v-if="step.description" class="text-sm text-slate-500 dark:text-white/50 mb-6">
            {{ step.description }}
          </p>

          <div class="space-y-4">
            <template v-for="el in step.elements" :key="el.id">
              <div v-if="el.type === 'row'" class="flex flex-wrap gap-3">
                <div
                  v-for="child in el.children ?? []"
                  :key="child.id"
                  class="flex-1 min-w-[180px] basis-0"
                >
                  <LiveField
                    :element="child"
                    :model-value="values[child.id] ?? ''"
                    @update:model-value="(v: string | string[]) => (values[child.id] = v)"
                  />
                </div>
              </div>
              <LiveField
                v-else
                :element="el"
                :model-value="values[el.id] ?? ''"
                @update:model-value="(v: string | string[]) => (values[el.id] = v)"
              />
            </template>
          </div>

          <div class="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              @click="goBack"
              :disabled="idx === 0"
              class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-white/70 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:pointer-events-none"
              style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
            >
              <ChevronLeft class="h-3.5 w-3.5 rtl:rotate-180" /> Back
            </button>
            <button
              type="button"
              @click="goNext"
              class="ms-builder-primary flex items-center gap-1.5 text-sm"
            >
              {{ idx === store.steps.length - 1 ? 'Finish registration' : 'Continue' }}
              <ChevronRight class="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>

        <div
          v-else-if="done"
          class="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-500/30 dark:from-emerald-500/[0.08] dark:to-[#111118] p-10 text-center ms-fade-up"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-700 dark:text-emerald-300"
          >
            <Check class="h-6 w-6" />
          </div>
          <h1 class="font-heading font-bold text-2xl text-slate-900 dark:text-white mb-2">
            Your tenant is ready 🎉
          </h1>
          <p class="text-sm text-slate-500 dark:text-white/50 mb-6">
            We've provisioned your workspace and sent a welcome email. Redirecting to your
            dashboard…
          </p>
          <button
            type="button"
            @click="restart"
            class="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-white/70 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"
          >
            Restart preview
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ms-builder-primary {
  background-image: linear-gradient(to right, #4f46e5, #6366f1);
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -10px rgba(99, 102, 241, 0.55);
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.ms-builder-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px -10px rgba(99, 102, 241, 0.7);
}

.ms-fade-up {
  animation: ms-fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes ms-fade-up {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ms-fade-up {
    animation: none;
  }
}
</style>
