<script setup lang="ts">
import Logo from './parts/Logo.vue'
import Wordmark from './parts/Wordmark.vue'

defineProps<{ progress: number; status: string }>()
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center">
    <div class="absolute inset-0 ss-grid-pattern pointer-events-none" aria-hidden="true" />

    <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[120px] bg-indigo-500/15" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[380px] h-[380px] rounded-full blur-[100px] bg-violet-500/10" />
    </div>

    <div class="relative flex flex-col items-center gap-7 px-8">
      <div class="anim-breath">
        <Logo :size="56" />
      </div>

      <div class="flex flex-col items-center gap-1.5">
        <Wordmark size="xl" />
        <p class="text-sm text-slate-500 font-medium tracking-wide">Intelligent forms, instantly.</p>
      </div>

      <div class="mt-4 w-64 flex flex-col gap-2.5">
        <div class="ss-track rounded-full h-[6px] overflow-hidden">
          <div
            class="ss-track-fill h-full rounded-full transition-[width] duration-200 ease-out"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono">
          <span class="text-slate-500">{{ status }}</span>
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
</style>
