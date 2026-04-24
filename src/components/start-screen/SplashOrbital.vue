<script setup lang="ts">
import Logo from './parts/Logo.vue'
import Wordmark from './parts/Wordmark.vue'

defineProps<{ progress: number; status: string }>()

const dots = [
  { color: '#818cf8', delay: 0 },
  { color: '#a78bfa', delay: -1.1 },
  { color: '#f472b6', delay: -2.2 },
]
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center">
    <div class="absolute inset-0 ss-grid-fine opacity-40 pointer-events-none" aria-hidden="true" />

    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full blur-[100px] bg-violet-500/15" />
    </div>

    <div class="relative flex flex-col items-center gap-8">
      <!-- Orbit system -->
      <div class="relative w-44 h-44 flex items-center justify-center">
        <svg class="absolute inset-0 dashed-ring" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="86" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="4 8" />
          <circle cx="100" cy="100" r="66" stroke="rgba(139,92,246,0.25)" stroke-width="1" stroke-dasharray="2 6" />
        </svg>

        <div class="absolute inset-8">
          <div class="pulse-ring" />
          <div class="pulse-ring" style="animation-delay: 1.2s" />
        </div>

        <span
          v-for="(d, i) in dots"
          :key="i"
          class="orbit-dot"
          :style="{
            ['--r' as string]: '72px',
            background: d.color,
            boxShadow: `0 0 12px ${d.color}`,
            animationDelay: `${d.delay}s`,
          }"
        />

        <div
          class="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center
                 bg-gradient-to-br from-indigo-500/20 to-violet-600/20
                 border border-white/10 backdrop-blur-xl shadow-[0_0_40px_-5px_rgba(139,92,246,0.5)]"
        >
          <Logo :size="40" />
        </div>
      </div>

      <div class="flex flex-col items-center gap-1">
        <Wordmark size="lg" />
        <div class="flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 anim-breath" />
          <span>{{ status }}</span>
          <span class="text-slate-600">·</span>
          <span class="text-indigo-400">{{ Math.round(progress) }}%</span>
        </div>
      </div>

      <div class="w-56 ss-track rounded-full h-[4px] overflow-hidden">
        <div class="ss-track-fill h-full rounded-full transition-[width] duration-200" :style="{ width: `${progress}%` }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ss-grid-fine {
  background-size: 24px 24px;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px);
}

.ss-track {
  background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.06), rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.06);
}
.ss-track-fill {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  box-shadow: 0 0 20px -2px rgba(139,92,246,0.5), inset 0 0 0 1px rgba(255,255,255,0.12);
}

@keyframes ss-breath { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.06); opacity: 1; } }
.anim-breath { animation: ss-breath 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

@keyframes ss-orbit {
  from { transform: rotate(0deg) translateX(var(--r)) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); }
}
.orbit-dot {
  position: absolute;
  top: 50%; left: 50%;
  width: 8px; height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 999px;
  animation: ss-orbit 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes ss-pulse-ring {
  0% { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0; }
}
.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 1px solid rgba(139, 92, 246, 0.5);
  animation: ss-pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}

@keyframes ss-dash-move { to { stroke-dashoffset: -24; } }
.dashed-ring circle { animation: ss-dash-move 2.2s linear infinite; }
</style>
