<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Logo from './parts/Logo.vue'
import Wordmark from './parts/Wordmark.vue'

defineProps<{ progress: number; status: string }>()

interface Field {
  t: number
  label: string
  type: 'email' | 'text' | 'select' | 'textarea'
  placeholder: string
}

const FIELDS: Field[] = [
  { t: 200,  label: 'Work email',    type: 'email',    placeholder: 'name@company.com' },
  { t: 650,  label: 'Full name',     type: 'text',     placeholder: 'Ada Lovelace' },
  { t: 1100, label: 'Company size',  type: 'select',   placeholder: '1–10 employees' },
  { t: 1550, label: 'Use case',      type: 'textarea', placeholder: "Tell us what you're building…" },
]

const visible = ref(0)
const timers: number[] = []

onMounted(() => {
  FIELDS.forEach((f, i) => {
    timers.push(window.setTimeout(() => { visible.value = i + 1 }, f.t))
  })
})
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center p-6">
    <div class="absolute inset-0 ss-grid-pattern pointer-events-none" aria-hidden="true" />
    <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full blur-[110px] bg-indigo-500/15" />
    </div>

    <div class="relative w-full max-w-md flex flex-col gap-7">
      <!-- Branding -->
      <div class="flex flex-col items-center gap-3">
        <div class="flex items-center gap-2.5">
          <Logo :size="32" />
          <Wordmark size="md" />
        </div>
        <div class="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span class="shimmer-text font-semibold">{{ status }}</span>
        </div>
      </div>

      <!-- Materializing form card -->
      <div class="ss-frame-window p-6">
        <div class="flex items-center justify-between mb-5">
          <div class="flex flex-col gap-1">
            <span class="soft-label text-violet-400">generating</span>
            <span class="font-heading font-bold text-white text-[15px]">Onboarding form</span>
          </div>
          <div class="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <svg class="w-3.5 h-3.5 text-indigo-400 anim-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round" />
            </svg>
            <span>{{ visible }}/{{ FIELDS.length }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div
            v-for="(f, i) in FIELDS"
            :key="i"
            class="flex flex-col gap-1.5 transition-all duration-500"
            :class="i < visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
          >
            <template v-if="i < visible">
              <span class="text-[11px] font-medium text-slate-400">{{ f.label }}</span>
              <div
                class="rounded-lg border px-3 bg-white/[0.025] border-white/[0.08]"
                :class="f.type === 'textarea' ? 'py-2.5' : 'py-2'"
              >
                <span class="text-[12.5px] text-slate-500">{{ f.placeholder }}</span>
                <div v-if="f.type === 'textarea'" class="h-3" />
              </div>
            </template>
            <template v-else>
              <div class="skel h-3 w-24 rounded" />
              <div class="skel rounded-lg" :class="f.type === 'textarea' ? 'h-16' : 'h-9'" />
            </template>
          </div>
        </div>

        <!-- Submit preview -->
        <div class="mt-5 transition-opacity duration-500" :class="visible >= FIELDS.length ? 'opacity-100' : 'opacity-40'">
          <div class="w-full h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25">
            Continue
          </div>
        </div>
      </div>

      <!-- Progress -->
      <div class="flex flex-col gap-2">
        <div class="ss-track rounded-full h-[5px] overflow-hidden">
          <div class="ss-track-fill h-full rounded-full transition-[width] duration-200" :style="{ width: `${progress}%` }" />
        </div>
        <div class="flex items-center justify-between text-[10.5px] font-mono text-slate-500">
          <span>Preparing your workspace</span>
          <span class="text-indigo-400 tabular-nums">{{ Math.round(progress) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ss-grid-pattern {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%);
}

.ss-frame-window {
  background: #06060d;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 20px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
}

.ss-track {
  background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.06), rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.06);
}
.ss-track-fill {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  box-shadow: 0 0 20px -2px rgba(139,92,246,0.5), inset 0 0 0 1px rgba(255,255,255,0.12);
}

.soft-label { letter-spacing: 0.08em; text-transform: uppercase; font-size: 11px; font-weight: 600; }

@keyframes ss-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer-text {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.45) 0%,
    rgba(255,255,255,0.45) 40%,
    #fff 50%,
    rgba(255,255,255,0.45) 60%,
    rgba(255,255,255,0.45) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ss-shimmer 2.6s linear infinite;
}

@keyframes ss-spin-slow { to { transform: rotate(360deg); } }
.anim-spin-slow { animation: ss-spin-slow 3.2s linear infinite; }

.skel {
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%);
  background-size: 200% 100%;
  animation: ss-shimmer 1.8s linear infinite;
}
</style>
