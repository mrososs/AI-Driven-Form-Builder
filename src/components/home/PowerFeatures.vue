<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Activity, Palette, Plug, Check } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <section class="relative w-full py-24 sm:py-28">

    <!-- Section header -->
    <div class="mx-auto max-w-2xl px-6 text-center">
      <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
        {{ t('power.eyebrow') }}
      </p>
      <h2 class="mt-3 font-heading font-bold tracking-tight
        text-3xl sm:text-4xl
        text-slate-900 dark:text-white">
        {{ t('power.title') }}
      </h2>
      <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
        {{ t('power.subtitle') }}
      </p>
    </div>

    <!-- Asymmetric grid: 1 spotlight + 2 stacked supporting cards -->
    <div class="mx-auto mt-16 sm:mt-20 max-w-7xl px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Spotlight: Zoneless + Signals (indigo→violet) -->
        <div class="relative flex flex-col p-8 sm:p-10 rounded-3xl overflow-hidden
          bg-gradient-to-br from-indigo-50 via-white to-violet-50
          dark:from-indigo-500/[0.08] dark:via-[#0c0c1a] dark:to-violet-500/[0.08]
          border border-indigo-200/70 dark:border-indigo-500/20
          shadow-xl shadow-indigo-500/10 dark:shadow-black/40">

          <!-- Decorative waveform — strategic accent, not gradient overload -->
          <div class="absolute -top-8 -right-8 w-56 h-56 rounded-full
            bg-indigo-400/15 dark:bg-indigo-500/15
            blur-3xl pointer-events-none" aria-hidden="true"></div>

          <div class="relative flex items-center gap-3">
            <div class="flex items-center justify-center w-12 h-12 rounded-2xl
              bg-white dark:bg-white/[0.06]
              border border-indigo-200 dark:border-indigo-500/30
              shadow-sm">
              <Activity class="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full
              bg-indigo-100 dark:bg-indigo-500/15
              text-indigo-700 dark:text-indigo-300
              border border-indigo-200/70 dark:border-indigo-500/25
              text-[11px] font-semibold uppercase tracking-wider">
              {{ t('power.signals.badge') }}
            </span>
          </div>

          <h3 class="relative mt-6 font-heading font-bold tracking-tight
            text-2xl sm:text-3xl leading-tight
            text-slate-900 dark:text-white">
            {{ t('power.signals.title') }}
          </h3>

          <p class="relative mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl">
            {{ t('power.signals.desc') }}
          </p>

          <ul class="relative mt-8 space-y-3">
            <li v-for="key in ['point1','point2','point3']" :key="key" class="flex gap-3 text-sm text-slate-700 dark:text-slate-200">
              <span class="shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full
                bg-indigo-100 dark:bg-indigo-500/20
                text-indigo-600 dark:text-indigo-300
                ring-1 ring-indigo-200/60 dark:ring-indigo-500/30">
                <Check class="w-3 h-3" aria-hidden="true" />
              </span>
              <span class="leading-relaxed">{{ t(`power.signals.${key}`) }}</span>
            </li>
          </ul>

          <!-- Signal code chip pinned bottom -->
          <div class="relative mt-auto pt-8">
            <div dir="ltr" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl
              bg-white/80 dark:bg-white/[0.05]
              border border-indigo-200/60 dark:border-indigo-500/20
              backdrop-blur-sm">
              <span class="font-mono text-xs text-indigo-600 dark:text-indigo-400">const</span>
              <span class="font-mono text-xs text-slate-700 dark:text-slate-200">value</span>
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500">=</span>
              <span class="font-mono text-xs text-violet-600 dark:text-violet-300">signal</span>
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500">(</span>
              <span class="font-mono text-xs text-emerald-600 dark:text-emerald-300">'pro'</span>
              <span class="font-mono text-xs text-slate-400 dark:text-slate-500">)</span>
            </div>
          </div>
        </div>

        <!-- Right column: two stacked supporting cards -->
        <div class="flex flex-col gap-6">

          <!-- Tailwind v4 — sky -->
          <div class="group relative flex-1 flex flex-col p-6 lg:p-8 rounded-3xl
            bg-slate-50 dark:bg-white/[0.03]
            border border-slate-200 dark:border-white/[0.07]
            hover:border-sky-300 dark:hover:border-sky-500/30
            hover:bg-white dark:hover:bg-sky-950/15
            hover:shadow-lg hover:shadow-sky-500/10
            transition-all duration-300">

            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-11 h-11 rounded-2xl
                bg-sky-50 dark:bg-sky-500/10
                border border-sky-200/70 dark:border-sky-500/20
                group-hover:scale-105 transition-transform duration-300">
                <Palette class="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              </div>
              <span class="inline-flex items-center px-2.5 py-1 rounded-full
                bg-sky-50 dark:bg-sky-500/10
                text-sky-700 dark:text-sky-300
                border border-sky-200/70 dark:border-sky-500/20
                text-[11px] font-mono font-semibold uppercase tracking-wider">
                {{ t('power.tailwind.badge') }}
              </span>
            </div>

            <h3 class="mt-5 font-heading font-bold tracking-tight
              text-xl sm:text-2xl leading-tight
              text-slate-900 dark:text-white">
              {{ t('power.tailwind.title') }}
            </h3>
            <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {{ t('power.tailwind.desc') }}
            </p>
          </div>

          <!-- MCP server — emerald -->
          <div class="group relative flex-1 flex flex-col p-6 lg:p-8 rounded-3xl
            bg-slate-50 dark:bg-white/[0.03]
            border border-slate-200 dark:border-white/[0.07]
            hover:border-emerald-300 dark:hover:border-emerald-500/30
            hover:bg-white dark:hover:bg-emerald-950/15
            hover:shadow-lg hover:shadow-emerald-500/10
            transition-all duration-300">

            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-11 h-11 rounded-2xl
                bg-emerald-50 dark:bg-emerald-500/10
                border border-emerald-200/70 dark:border-emerald-500/20
                group-hover:scale-105 transition-transform duration-300">
                <Plug class="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
              <span class="inline-flex items-center px-2.5 py-1 rounded-full
                bg-emerald-50 dark:bg-emerald-500/10
                text-emerald-700 dark:text-emerald-300
                border border-emerald-200/70 dark:border-emerald-500/20
                text-[11px] font-mono font-semibold uppercase tracking-wider">
                {{ t('power.mcp.badge') }}
              </span>
            </div>

            <h3 class="mt-5 font-heading font-bold tracking-tight
              text-xl sm:text-2xl leading-tight
              text-slate-900 dark:text-white">
              {{ t('power.mcp.title') }}
            </h3>
            <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {{ t('power.mcp.desc') }}
            </p>
          </div>

        </div>

      </div>
    </div>
  </section>
</template>
