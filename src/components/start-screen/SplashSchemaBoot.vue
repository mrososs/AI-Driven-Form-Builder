<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Logo from './parts/Logo.vue'
import Wordmark from './parts/Wordmark.vue'

defineProps<{ progress: number; status: string }>()

type Tone = 'user' | 'dim' | 'ok' | 'accent'
interface BootLine {
  t: number
  text: string
  prefix?: string
  tone: Tone
}

const BOOT_LINES: BootLine[] = [
  { t: 120,  text: 'formai.boot', prefix: '$', tone: 'user' },
  { t: 380,  text: 'Loading runtime · v2.4.1', tone: 'dim' },
  { t: 620,  text: '✓ Schema engine ready', tone: 'ok' },
  { t: 880,  text: '✓ LLM adapter connected', tone: 'ok' },
  { t: 1140, text: '✓ Validation pipeline armed', tone: 'ok' },
  { t: 1400, text: 'Hydrating component registry…', tone: 'dim' },
  { t: 1700, text: '✓ 84 elements registered', tone: 'ok' },
  { t: 1950, text: 'Warming up workspace', tone: 'accent' },
]

const lineCount = ref(0)
const timers: number[] = []

onMounted(() => {
  BOOT_LINES.forEach((ln, i) => {
    timers.push(window.setTimeout(() => { lineCount.value = i + 1 }, ln.t))
  })
})
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
})

function toneClass(tone: Tone): string {
  switch (tone) {
    case 'user':   return 'text-white'
    case 'ok':     return 'text-emerald-300/90'
    case 'accent': return 'text-violet-300'
    case 'dim':    return 'text-slate-400'
  }
}
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center p-6">
    <div class="absolute inset-0 ss-grid-fine opacity-40" aria-hidden="true" />
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[300px] blur-[90px] bg-indigo-500/15 rounded-full" />
    </div>

    <div class="relative w-full max-w-xl flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-600/20 border border-white/10 flex items-center justify-center">
          <Logo :size="24" />
        </div>
        <div class="flex flex-col">
          <Wordmark size="md" />
          <span class="text-[11px] font-mono text-slate-500 tracking-wide">initializing workspace…</span>
        </div>
        <div class="ml-auto flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-rose-400/60" />
          <span class="w-2 h-2 rounded-full bg-amber-400/60" />
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      <!-- Terminal window -->
      <div class="ss-frame-window relative">
        <div class="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div class="flex gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span class="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span class="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span class="ml-2 text-[11px] font-mono text-slate-500">~/formai · boot.log</span>
        </div>

        <div class="relative p-5 font-mono text-[12.5px] leading-[1.75] min-h-[220px]">
          <div class="scanline" aria-hidden="true" />
          <div
            v-for="(ln, i) in BOOT_LINES.slice(0, lineCount)"
            :key="i"
            class="anim-fade-up flex gap-2"
          >
            <span v-if="ln.prefix" class="text-indigo-400 shrink-0">{{ ln.prefix }}</span>
            <span v-else class="text-slate-600 shrink-0">›</span>
            <span :class="toneClass(ln.tone)">{{ ln.text }}</span>
          </div>
          <div v-if="lineCount < BOOT_LINES.length" class="flex gap-2 text-slate-600">
            <span>›</span>
            <span class="caret" />
          </div>
        </div>

        <!-- Progress footer -->
        <div class="px-5 py-3 border-t border-white/[0.06] bg-white/[0.015] flex items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-[11px] font-mono text-slate-400 min-w-0">
            <span class="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 anim-breath" />
            <span class="truncate">{{ status }}</span>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <div class="w-28 ss-track rounded-full h-[3px] overflow-hidden">
              <div class="ss-track-fill h-full rounded-full transition-[width] duration-200" :style="{ width: `${progress}%` }" />
            </div>
            <span class="text-[11px] font-mono text-indigo-400 tabular-nums w-8 text-right">{{ Math.round(progress) }}%</span>
          </div>
        </div>
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

@keyframes ss-breath { 0%,100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.06); opacity: 1; } }
.anim-breath { animation: ss-breath 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

@keyframes ss-fade-up {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
.anim-fade-up { animation: ss-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }

@keyframes ss-blink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
.caret::after {
  content: '▌';
  margin-left: 2px;
  color: #a78bfa;
  animation: ss-blink 1s steps(1) infinite;
}

@keyframes ss-scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
.scanline {
  position: absolute;
  left: 0; right: 0;
  height: 40%;
  background: linear-gradient(180deg, transparent, rgba(139,92,246,0.12), transparent);
  animation: ss-scanline 3.2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  pointer-events: none;
}
</style>
