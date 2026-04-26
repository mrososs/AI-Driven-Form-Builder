<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import {
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  Eye,
  Download,
  Smartphone,
  Monitor as MonitorIcon,
  Workflow,
  Layers,
  GitBranch,
  Footprints,
} from 'lucide-vue-next'
import Navbar from '../components/layout/Navbar.vue'
import Footer from '../components/layout/Footer.vue'

import builderShot from '../assets/docs/builder-properties-light.png'
import builderDarkShot from '../assets/docs/builder-canvas-dark.png'
import previewMobileShot from '../assets/docs/preview-mobile.png'
import previewDesktopShot from '../assets/docs/preview-desktop.png'
import exportShot from '../assets/docs/builder-export-dialog.png'
import promptShot from '../assets/docs/builder-ai-prompt.png'
import multistepBuilderShot from '../assets/docs/multistep-builder.png'
import multistepLogicShot from '../assets/docs/multistep-logic.png'
import multistepPreviewShot from '../assets/docs/multistep-preview.png'

const { t } = useI18n()

const examples = [
  {
    key: 'multistepBuilder',
    image: multistepBuilderShot,
    accent: 'indigo',
    badgeIcon: Layers,
  },
  {
    key: 'multistepLogic',
    image: multistepLogicShot,
    accent: 'violet',
    badgeIcon: GitBranch,
  },
  {
    key: 'multistepPreview',
    image: multistepPreviewShot,
    accent: 'rose',
    badgeIcon: Footprints,
  },
  {
    key: 'onboarding',
    image: builderShot,
    accent: 'indigo',
    badgeIcon: Workflow,
  },
  {
    key: 'preview',
    image: previewDesktopShot,
    accent: 'violet',
    badgeIcon: MonitorIcon,
  },
  {
    key: 'mobile',
    image: previewMobileShot,
    accent: 'emerald',
    badgeIcon: Smartphone,
  },
  {
    key: 'export',
    image: exportShot,
    accent: 'sky',
    badgeIcon: Download,
  },
  {
    key: 'aiPrompt',
    image: promptShot,
    accent: 'amber',
    badgeIcon: Sparkles,
  },
  {
    key: 'darkMode',
    image: builderDarkShot,
    accent: 'fuchsia',
    badgeIcon: Eye,
  },
] as const

const accentMap = {
  indigo: {
    badge: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-500/25',
    glow: 'group-hover:shadow-indigo-500/20',
    border: 'group-hover:border-indigo-300 dark:group-hover:border-indigo-500/30',
  },
  violet: {
    badge: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200/70 dark:border-violet-500/25',
    glow: 'group-hover:shadow-violet-500/20',
    border: 'group-hover:border-violet-300 dark:group-hover:border-violet-500/30',
  },
  emerald: {
    badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-500/25',
    glow: 'group-hover:shadow-emerald-500/20',
    border: 'group-hover:border-emerald-300 dark:group-hover:border-emerald-500/30',
  },
  sky: {
    badge: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-500/25',
    glow: 'group-hover:shadow-sky-500/20',
    border: 'group-hover:border-sky-300 dark:group-hover:border-sky-500/30',
  },
  amber: {
    badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-500/25',
    glow: 'group-hover:shadow-amber-500/20',
    border: 'group-hover:border-amber-300 dark:group-hover:border-amber-500/30',
  },
  fuchsia: {
    badge: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200/70 dark:border-fuchsia-500/25',
    glow: 'group-hover:shadow-fuchsia-500/20',
    border: 'group-hover:border-fuchsia-300 dark:group-hover:border-fuchsia-500/30',
  },
  rose: {
    badge: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-500/25',
    glow: 'group-hover:shadow-rose-500/20',
    border: 'group-hover:border-rose-300 dark:group-hover:border-rose-500/30',
  },
} as const
</script>

<template>
  <div class="relative min-h-screen antialiased bg-white dark:bg-[#08080f] flex flex-col">
    <div class="absolute inset-0 bg-grid-pattern pointer-events-none" aria-hidden="true"></div>

    <Navbar />

    <main class="relative z-10 flex flex-col items-center w-full flex-1">
      <!-- Hero -->
      <section class="relative w-full pt-24 pb-12 sm:pt-32 sm:pb-16">
        <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div class="absolute -top-32 right-1/3 w-[480px] h-[480px]
            bg-violet-500/8 dark:bg-violet-500/25
            rounded-full blur-[110px]"></div>
          <div class="absolute top-0 left-0 w-[420px] h-[420px]
            bg-indigo-500/6 dark:bg-indigo-500/20
            rounded-full blur-[90px]"></div>
        </div>

        <div class="relative max-w-5xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
          <span class="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs
            ring-1 ring-slate-200 dark:ring-white/[0.1]
            bg-white/70 dark:bg-white/[0.04]
            backdrop-blur-sm shadow-sm dark:shadow-none">
            <LayoutDashboard class="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
            <span class="font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
              {{ t('examples.hero.eyebrow') }}
            </span>
          </span>

          <h1 class="mt-8 max-w-3xl font-extrabold tracking-tight font-heading
            text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.1]
            text-slate-900 dark:text-white">
            {{ t('examples.hero.titleP1') }}
            <span class="block bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500
              dark:from-violet-400 dark:via-indigo-400 dark:to-pink-400
              bg-clip-text text-transparent pb-1">
              {{ t('examples.hero.titleGradient') }}
            </span>
          </h1>

          <p class="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {{ t('examples.hero.subtitle') }}
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-3 justify-center">
            <RouterLink to="/builder"
              class="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white
                bg-indigo-600 hover:bg-indigo-500
                dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600
                dark:hover:from-indigo-400 dark:hover:to-violet-500
                shadow-lg shadow-indigo-500/25
                transition-all duration-200 hover:-translate-y-0.5">
              {{ t('examples.hero.cta') }}
              <ArrowRight class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </RouterLink>
            <RouterLink to="/docs"
              class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl
                text-slate-700 dark:text-white/80
                bg-white dark:bg-white/[0.05]
                border border-slate-200 dark:border-white/[0.09]
                hover:bg-slate-50 dark:hover:bg-white/[0.09]
                transition-all duration-200">
              {{ t('examples.hero.docs') }}
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Showcase grid -->
      <section class="relative w-full pb-20 sm:pb-28">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <article v-for="(ex, idx) in examples" :key="ex.key"
              :class="[
                'group relative flex flex-col rounded-3xl overflow-hidden',
                'bg-white dark:bg-white/[0.025]',
                'border border-slate-200 dark:border-white/[0.07]',
                'shadow-md shadow-slate-200/40 dark:shadow-black/30',
                'hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300',
                accentMap[ex.accent].border,
                accentMap[ex.accent].glow,
                idx === 0 ? 'md:col-span-2' : '',
              ]">

              <!-- Browser chrome -->
              <div class="flex items-center gap-1.5 px-4 py-3
                border-b border-slate-200 dark:border-white/[0.06]
                bg-slate-50/80 dark:bg-white/[0.02]">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-400/70"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-amber-400/70"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-400/70"></div>
                <span class="ml-3 text-[11px] font-mono text-slate-500 dark:text-white/40 truncate">
                  {{ t(`examples.cards.${ex.key}.url`) }}
                </span>
                <span :class="[
                  'ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full',
                  'text-[10px] font-semibold uppercase tracking-wider border',
                  accentMap[ex.accent].badge,
                ]">
                  <component :is="ex.badgeIcon" class="h-3 w-3" />
                  {{ t(`examples.cards.${ex.key}.tag`) }}
                </span>
              </div>

              <!-- Image -->
              <div class="relative bg-slate-50 dark:bg-[#0a0a12] overflow-hidden">
                <img :src="ex.image" :alt="t(`examples.cards.${ex.key}.title`)"
                  class="block w-full h-auto transition-transform duration-500 group-hover:scale-[1.015]"
                  loading="lazy" />
              </div>

              <!-- Body -->
              <div class="p-5 sm:p-6 flex flex-col gap-2">
                <h3 class="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                  {{ t(`examples.cards.${ex.key}.title`) }}
                </h3>
                <p class="text-sm leading-relaxed text-slate-600 dark:text-white/60">
                  {{ t(`examples.cards.${ex.key}.desc`) }}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="relative w-full pb-24 sm:pb-32">
        <div class="mx-auto max-w-4xl px-6 lg:px-8">
          <div class="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center
            bg-gradient-to-br from-indigo-50 via-white to-violet-50
            dark:from-indigo-500/[0.08] dark:via-[#0c0c1a] dark:to-violet-500/[0.08]
            border border-indigo-200/70 dark:border-indigo-500/20
            shadow-xl shadow-indigo-500/10 dark:shadow-black/40">
            <div class="absolute -top-16 -right-16 w-56 h-56 rounded-full
              bg-indigo-400/15 dark:bg-indigo-500/15 blur-3xl pointer-events-none"
              aria-hidden="true"></div>
            <h2 class="relative font-heading font-bold tracking-tight
              text-2xl sm:text-3xl text-slate-900 dark:text-white">
              {{ t('examples.cta.title') }}
            </h2>
            <p class="relative mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              {{ t('examples.cta.subtitle') }}
            </p>
            <RouterLink to="/builder"
              class="relative mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white
                bg-indigo-600 hover:bg-indigo-500
                dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600
                dark:hover:from-indigo-400 dark:hover:to-violet-500
                shadow-md shadow-indigo-500/25
                transition-all duration-200 hover:-translate-y-0.5 group">
              {{ t('examples.cta.button') }}
              <ArrowRight class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>
