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
const total = computed(() => store.steps.length)
const pct = computed(() =>
  done.value ? 100 : total.value === 0 ? 0 : Math.round(((idx.value + 1) / total.value) * 100),
)

function goNext() {
  if (idx.value < store.steps.length - 1) {
    idx.value++
  } else {
    done.value = true
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goBack() {
  if (idx.value > 0) {
    idx.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function restart() {
  done.value = false
  idx.value = 0
  for (const key in values) delete values[key]
}

const firstName = computed(() => {
  for (const s of store.steps) {
    for (const el of s.elements) {
      const targets = el.type === 'row' ? (el.children ?? []) : [el]
      for (const child of targets) {
        if (/first.*name|name|guest/i.test(child.label)) {
          const v = values[child.id]
          if (typeof v === 'string' && v.trim()) return v.trim().split(/\s+/)[0]
        }
      }
    }
  }
  return ''
})

const guestEmail = computed(() => {
  for (const s of store.steps) {
    for (const el of s.elements) {
      const targets = el.type === 'row' ? (el.children ?? []) : [el]
      for (const child of targets) {
        if (child.type === 'email') {
          const v = values[child.id]
          if (typeof v === 'string' && v.trim()) return v.trim()
        }
      }
    }
  }
  return ''
})
</script>

<template>
  <div class="ms-preview flex-1 min-h-0 flex flex-col">
    <!-- Empty state -->
    <div
      v-if="store.steps.length === 0"
      class="flex-1 flex items-center justify-center p-10"
    >
      <div class="max-w-md text-center">
        <button
          type="button"
          @click="emit('exit')"
          class="ms-back-link mb-6"
        >
          <ChevronLeft class="h-3.5 w-3.5 rtl:rotate-180" /> Back to builder
        </button>
        <p class="text-[14px]" style="color: var(--ms-muted)">
          Add at least one step in the builder to preview the respondent flow.
        </p>
      </div>
    </div>

    <template v-else>
      <!-- Sticky top bar with progress -->
      <header class="ms-topbar">
        <button
          type="button"
          class="ms-topbar-arrow"
          @click="goBack"
          :disabled="idx === 0 || done"
          aria-label="Previous step"
        >
          <ChevronLeft class="h-4 w-4 rtl:rotate-180" />
        </button>
        <div class="ms-progress-track">
          <div
            class="ms-progress-fill"
            :style="{ width: `${pct}%` }"
          />
        </div>
        <span class="ms-step-label">
          {{ done ? 'Done' : `Step ${idx + 1}/${total}` }}
        </span>
        <button
          type="button"
          class="ms-topbar-arrow"
          @click="goNext"
          :disabled="done"
          aria-label="Next step"
        >
          <ChevronRight class="h-4 w-4 rtl:rotate-180" />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto scrollbar-thin">
        <div class="ms-shell">
          <button
            type="button"
            @click="emit('exit')"
            class="ms-back-link mb-5"
          >
            <ChevronLeft class="h-3.5 w-3.5 rtl:rotate-180" /> Back to builder
          </button>

          <!-- Active step card -->
          <div
            v-if="!done && step"
            :key="step.id"
            class="ms-form-card ms-fade-up"
          >
            <header class="ms-step-header">
              <div class="ms-step-icon-row">
                <span class="ms-step-icon">
                  <component :is="stepIcon" class="h-[18px] w-[18px]" />
                </span>
                <span class="ms-step-pill">Step {{ idx + 1 }} of {{ total }}</span>
              </div>
              <h1 class="ms-step-title">{{ step.title }}</h1>
              <p v-if="step.description" class="ms-step-sub">{{ step.description }}</p>
            </header>

            <div class="ms-fields">
              <template v-for="el in step.elements" :key="el.id">
                <div v-if="el.type === 'row'" class="ms-fields-row">
                  <LiveField
                    v-for="child in el.children ?? []"
                    :key="child.id"
                    :element="child"
                    :model-value="values[child.id] ?? ''"
                    @update:model-value="(v: string | string[]) => (values[child.id] = v)"
                  />
                </div>
                <LiveField
                  v-else
                  :element="el"
                  :model-value="values[el.id] ?? ''"
                  @update:model-value="(v: string | string[]) => (values[el.id] = v)"
                />
              </template>
            </div>

            <div class="ms-step-nav">
              <button
                v-if="idx > 0"
                type="button"
                class="ms-btn ms-btn-secondary"
                @click="goBack"
              >
                <ChevronLeft class="h-3.5 w-3.5 rtl:rotate-180" /> Back
              </button>
              <span v-else />
              <button
                type="button"
                class="ms-btn ms-btn-primary"
                @click="goNext"
              >
                {{ idx === total - 1 ? 'Confirm reservation' : 'Continue' }}
                <ChevronRight class="h-3.5 w-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>

          <!-- Confirmation -->
          <div
            v-else-if="done"
            class="ms-form-card ms-fade-up"
          >
            <div class="ms-confirm-icon">
              <Check class="h-[26px] w-[26px]" />
            </div>
            <span class="ms-step-pill ms-pill-standalone">Reservation confirmed</span>
            <h1 class="ms-step-title mt-3">
              Thank you{{ firstName ? `, ${firstName}` : '' }}.
            </h1>
            <p class="ms-step-sub">
              A confirmation has been sent to
              {{ guestEmail || 'your email' }}. We'll reach out before arrival.
            </p>
            <div class="mt-7 flex gap-2.5">
              <button type="button" class="ms-btn ms-btn-primary" @click="restart">
                Make another reservation
              </button>
              <button type="button" class="ms-btn ms-btn-secondary" @click="emit('exit')">
                Back to builder
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ms-preview {
  --ms-bg: #f4f5f7;
  --ms-paper: #ffffff;
  --ms-ink: #0f172a;
  --ms-muted: #64748b;
  --ms-muted-2: #94a3b8;
  --ms-line: #e5e7eb;
  --ms-line-2: #eef0f4;
  --ms-primary: #6a4cff;
  --ms-primary-soft: #efeaff;
  --ms-primary-ink: #4b33c7;
  --ms-warn: #dc2626;

  font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  background: var(--ms-bg);
  color: var(--ms-ink);
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.ms-topbar {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 32px;
  background: var(--ms-paper);
  border-bottom: 1px solid var(--ms-line);
  position: sticky;
  top: 0;
  z-index: 10;
}

.ms-topbar-arrow {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ms-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease,
    opacity 120ms ease;
}
.ms-topbar-arrow:hover:not(:disabled) {
  background: var(--ms-line-2);
  color: var(--ms-ink);
}
.ms-topbar-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ms-progress-track {
  flex: 1;
  height: 6px;
  background: var(--ms-line);
  border-radius: 999px;
  overflow: hidden;
}

.ms-progress-fill {
  height: 100%;
  background: var(--ms-primary);
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.ms-step-label {
  font-size: 13px;
  color: var(--ms-muted);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ms-shell {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px 96px;
}

.ms-back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ms-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 120ms ease;
}
.ms-back-link:hover {
  color: var(--ms-ink);
}

.ms-form-card {
  background: var(--ms-paper);
  border: 1px solid var(--ms-line);
  border-radius: 16px;
  padding: 40px 44px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.ms-step-header {
  margin-bottom: 32px;
}

.ms-step-icon-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.ms-step-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--ms-primary-soft);
  color: var(--ms-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ms-step-pill {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ms-muted);
  font-weight: 600;
  padding: 4px 10px;
  border: 1px solid var(--ms-line);
  border-radius: 6px;
  margin-inline-start: 10px;
  vertical-align: middle;
  text-transform: uppercase;
  white-space: nowrap;
}

.ms-pill-standalone {
  margin-inline-start: 0;
}

.ms-step-title {
  font-size: 28px;
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  color: var(--ms-ink);
  text-wrap: pretty;
}

.ms-step-sub {
  color: var(--ms-muted);
  font-size: 14px;
  margin: 0;
  text-wrap: pretty;
}

.ms-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ms-fields-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.ms-step-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 36px;
  padding-top: 28px;
  border-top: 1px solid var(--ms-line);
}

.ms-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.005em;
  transition:
    background-color 140ms ease,
    border-color 140ms ease,
    color 140ms ease;
  border: 1px solid transparent;
  height: 44px;
  font-family: inherit;
  cursor: pointer;
}

.ms-btn-primary {
  background: var(--ms-primary);
  color: var(--ms-paper);
}
.ms-btn-primary:hover {
  background: var(--ms-primary-ink);
}
.ms-btn-primary:disabled {
  background: var(--ms-muted-2);
  cursor: not-allowed;
}

.ms-btn-secondary {
  background: var(--ms-paper);
  color: var(--ms-ink);
  border-color: var(--ms-line);
}
.ms-btn-secondary:hover {
  border-color: var(--ms-muted);
}

.ms-confirm-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--ms-primary-soft);
  color: var(--ms-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
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

@media (max-width: 640px) {
  .ms-form-card {
    padding: 28px 20px;
  }
  .ms-shell {
    padding: 20px 16px 64px;
  }
  .ms-topbar {
    padding: 0 16px;
    gap: 12px;
  }
  .ms-step-title {
    font-size: 24px;
  }
}
</style>
