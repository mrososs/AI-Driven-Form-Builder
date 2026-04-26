<script setup lang="ts">
import { onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import {
  BookOpen,
  Layers,
  SlidersHorizontal,
  Sparkles,
  Eye,
  Download,
  ArrowRight,
  Rocket,
  Wand2,
  ShieldCheck,
  GitBranch,
  SkipForward,
  Lock,
  CloudCog,
} from 'lucide-vue-next'
import Navbar from '../components/layout/Navbar.vue'
import Footer from '../components/layout/Footer.vue'

import canvasShot from '../assets/docs/builder-properties-light.png'
import propertiesDarkShot from '../assets/docs/builder-properties-dark.png'
import canvasDarkShot from '../assets/docs/builder-canvas-dark.png'
import exportShot from '../assets/docs/builder-export-dialog.png'
import promptShot from '../assets/docs/builder-ai-prompt.png'
import previewMobileShot from '../assets/docs/preview-mobile.png'
import previewDesktopShot from '../assets/docs/preview-desktop.png'
import multistepBuilderShot from '../assets/docs/multistep-builder.png'
import multistepPreviewShot from '../assets/docs/multistep-preview.png'
import multistepLogicShot from '../assets/docs/multistep-logic.png'

const { t } = useI18n()

const sections = [
  { id: 'overview', label: 'docs.toc.overview' },
  { id: 'getting-started', label: 'docs.toc.gettingStarted' },
  { id: 'elements', label: 'docs.toc.elements' },
  { id: 'properties', label: 'docs.toc.properties' },
  { id: 'preview', label: 'docs.toc.preview' },
  { id: 'export', label: 'docs.toc.export' },
  { id: 'ai-prompt', label: 'docs.toc.aiPrompt' },
  { id: 'multistep', label: 'docs.toc.multistep' },
] as const

const multistepRules = [
  { key: 'branch', icon: GitBranch, accent: 'indigo' },
  { key: 'skip', icon: SkipForward, accent: 'violet' },
  { key: 'gate', icon: Lock, accent: 'emerald' },
  { key: 'async', icon: CloudCog, accent: 'amber' },
] as const

const multistepRuleAccent = {
  indigo: {
    wrap: 'bg-indigo-50/60 dark:bg-indigo-500/[0.08] border-indigo-200/70 dark:border-indigo-500/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },
  violet: {
    wrap: 'bg-violet-50/60 dark:bg-violet-500/[0.08] border-violet-200/70 dark:border-violet-500/20',
    icon: 'text-violet-600 dark:text-violet-400',
  },
  emerald: {
    wrap: 'bg-emerald-50/60 dark:bg-emerald-500/[0.08] border-emerald-200/70 dark:border-emerald-500/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    wrap: 'bg-amber-50/60 dark:bg-amber-500/[0.08] border-amber-200/70 dark:border-amber-500/20',
    icon: 'text-amber-600 dark:text-amber-400',
  },
} as const

const activeId = shallowRef<string>(sections[0].id)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const targets = sections
    .map(s => document.getElementById(s.id))
    .filter((el): el is HTMLElement => el !== null)

  const visible = new Map<string, number>()

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.set(entry.target.id, entry.intersectionRatio)
        } else {
          visible.delete(entry.target.id)
        }
      }
      if (visible.size === 0) return
      let best: { id: string; ratio: number } | null = null
      for (const s of sections) {
        const r = visible.get(s.id)
        if (r !== undefined && (!best || r > best.ratio)) {
          best = { id: s.id, ratio: r }
        }
      }
      if (best) activeId.value = best.id
    },
    {
      rootMargin: '-120px 0px -55% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    }
  )

  for (const el of targets) observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div class="relative min-h-screen antialiased bg-white dark:bg-[#08080f] flex flex-col">
    <div class="absolute inset-0 bg-grid-pattern pointer-events-none" aria-hidden="true"></div>

    <Navbar />

    <main class="relative z-10 flex flex-col items-center w-full flex-1">
      <!-- Hero -->
      <section class="relative w-full pt-24 pb-12 sm:pt-32 sm:pb-16">
        <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div class="absolute -top-32 -left-24 w-[480px] h-[480px]
            bg-indigo-500/8 dark:bg-indigo-500/25
            rounded-full blur-[110px]"></div>
          <div class="absolute -top-16 right-0 w-[420px] h-[420px]
            bg-violet-500/6 dark:bg-violet-500/20
            rounded-full blur-[90px]"></div>
        </div>

        <div class="relative max-w-5xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
          <span class="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs
            ring-1 ring-slate-200 dark:ring-white/[0.1]
            bg-white/70 dark:bg-white/[0.04]
            backdrop-blur-sm shadow-sm dark:shadow-none">
            <BookOpen class="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span class="font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              {{ t('docs.hero.eyebrow') }}
            </span>
          </span>

          <h1 class="mt-8 max-w-3xl font-extrabold tracking-tight font-heading
            text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.1]
            text-slate-900 dark:text-white">
            {{ t('docs.hero.titleP1') }}
            <span class="block bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500
              dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400
              bg-clip-text text-transparent pb-1">
              {{ t('docs.hero.titleGradient') }}
            </span>
          </h1>

          <p class="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {{ t('docs.hero.subtitle') }}
          </p>
        </div>
      </section>

      <!-- Two-column layout: TOC sidebar + content -->
      <section class="relative w-full pb-24 sm:pb-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">

          <!-- TOC -->
          <aside class="hidden lg:block">
            <div class="sticky top-24">
              <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-4">
                {{ t('docs.toc.title') }}
              </p>
              <nav class="relative flex flex-col gap-0.5 border-s border-slate-200 dark:border-white/[0.07]" aria-label="On this page">
                <a v-for="s in sections" :key="s.id" :href="`#${s.id}`"
                  :aria-current="activeId === s.id ? 'true' : undefined"
                  :class="[
                    'relative text-sm py-1.5 ps-4 pe-3 -ms-px transition-all duration-200',
                    'border-s-2',
                    activeId === s.id
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-indigo-500 dark:border-indigo-400'
                      : 'text-slate-600 dark:text-white/55 hover:text-slate-900 dark:hover:text-white border-transparent hover:border-slate-300 dark:hover:border-white/20',
                  ]">
                  {{ t(s.label) }}
                </a>
              </nav>
            </div>
          </aside>

          <!-- Content -->
          <div class="min-w-0 flex flex-col gap-20">

            <!-- Overview -->
            <article id="overview" class="scroll-mt-24">
              <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                01 — {{ t('docs.overview.eyebrow') }}
              </p>
              <h2 class="mt-3 font-heading font-bold tracking-tight
                text-3xl sm:text-4xl text-slate-900 dark:text-white">
                {{ t('docs.overview.title') }}
              </h2>
              <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {{ t('docs.overview.desc') }}
              </p>

              <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                  <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-500/20">
                    <Wand2 class="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 class="mt-4 font-heading font-bold text-base text-slate-900 dark:text-white">
                    {{ t('docs.overview.cards.drag.title') }}
                  </h3>
                  <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {{ t('docs.overview.cards.drag.desc') }}
                  </p>
                </div>
                <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                  <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200/70 dark:border-violet-500/20">
                    <ShieldCheck class="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 class="mt-4 font-heading font-bold text-base text-slate-900 dark:text-white">
                    {{ t('docs.overview.cards.logic.title') }}
                  </h3>
                  <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {{ t('docs.overview.cards.logic.desc') }}
                  </p>
                </div>
                <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                  <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20">
                    <Sparkles class="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 class="mt-4 font-heading font-bold text-base text-slate-900 dark:text-white">
                    {{ t('docs.overview.cards.export.title') }}
                  </h3>
                  <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {{ t('docs.overview.cards.export.desc') }}
                  </p>
                </div>
              </div>
            </article>

            <!-- Getting started -->
            <article id="getting-started" class="scroll-mt-24">
              <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                02 — {{ t('docs.start.eyebrow') }}
              </p>
              <h2 class="mt-3 font-heading font-bold tracking-tight
                text-3xl sm:text-4xl text-slate-900 dark:text-white">
                {{ t('docs.start.title') }}
              </h2>
              <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {{ t('docs.start.desc') }}
              </p>

              <ol class="mt-8 space-y-4">
                <li v-for="i in [1,2,3,4]" :key="i" class="flex gap-4 p-5 rounded-2xl
                  bg-slate-50 dark:bg-white/[0.03]
                  border border-slate-200 dark:border-white/[0.06]">
                  <span class="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl
                    bg-white dark:bg-white/[0.05]
                    border border-slate-200 dark:border-white/[0.08]
                    font-bold text-sm text-indigo-600 dark:text-indigo-400">
                    {{ i }}
                  </span>
                  <div class="min-w-0">
                    <h3 class="font-heading font-bold text-base text-slate-900 dark:text-white">
                      {{ t(`docs.start.step${i}.title`) }}
                    </h3>
                    <p class="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {{ t(`docs.start.step${i}.desc`) }}
                    </p>
                  </div>
                </li>
              </ol>

              <RouterLink to="/builder"
                class="mt-8 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white
                  bg-indigo-600 hover:bg-indigo-500
                  dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600
                  dark:hover:from-indigo-400 dark:hover:to-violet-500
                  shadow-md shadow-indigo-500/25
                  transition-all duration-200 hover:-translate-y-0.5 group">
                <Rocket class="h-4 w-4" />
                {{ t('docs.start.cta') }}
                <ArrowRight class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </RouterLink>
            </article>

            <!-- Elements -->
            <article id="elements" class="scroll-mt-24">
              <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                03 — {{ t('docs.elements.eyebrow') }}
              </p>
              <h2 class="mt-3 font-heading font-bold tracking-tight
                text-3xl sm:text-4xl text-slate-900 dark:text-white">
                {{ t('docs.elements.title') }}
              </h2>
              <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {{ t('docs.elements.desc') }}
              </p>

              <!-- Screenshot frame -->
              <figure class="mt-8 rounded-2xl overflow-hidden
                bg-white dark:bg-[#0d0d14]
                border border-slate-200 dark:border-white/[0.07]
                shadow-xl shadow-slate-200/40 dark:shadow-black/40
                ring-1 ring-inset ring-slate-100/50 dark:ring-white/[0.04]">
                <div class="flex items-center gap-1.5 px-4 py-3 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02]">
                  <div class="w-2.5 h-2.5 rounded-full bg-rose-400/70"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-amber-400/70"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-emerald-400/70"></div>
                  <span class="ml-3 text-xs font-mono text-slate-500 dark:text-white/40">/builder</span>
                </div>
                <img :src="canvasDarkShot" :alt="t('docs.elements.alt')"
                  class="block w-full h-auto" loading="lazy" />
                <figcaption class="px-4 py-3 text-xs text-slate-500 dark:text-white/40 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02]">
                  {{ t('docs.elements.caption') }}
                </figcaption>
              </figure>

              <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="key in ['text','choice','date','upload']" :key="key"
                  class="flex gap-3 p-4 rounded-xl
                  bg-slate-50 dark:bg-white/[0.03]
                  border border-slate-200 dark:border-white/[0.06]">
                  <Layers class="shrink-0 h-4 w-4 mt-1 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h4 class="font-semibold text-sm text-slate-900 dark:text-white">
                      {{ t(`docs.elements.groups.${key}.title`) }}
                    </h4>
                    <p class="mt-1 text-xs leading-relaxed text-slate-600 dark:text-white/50">
                      {{ t(`docs.elements.groups.${key}.desc`) }}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <!-- Properties -->
            <article id="properties" class="scroll-mt-24">
              <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                04 — {{ t('docs.properties.eyebrow') }}
              </p>
              <h2 class="mt-3 font-heading font-bold tracking-tight
                text-3xl sm:text-4xl text-slate-900 dark:text-white">
                {{ t('docs.properties.title') }}
              </h2>
              <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {{ t('docs.properties.desc') }}
              </p>

              <figure class="mt-8 rounded-2xl overflow-hidden
                bg-white dark:bg-[#0d0d14]
                border border-slate-200 dark:border-white/[0.07]
                shadow-xl shadow-slate-200/40 dark:shadow-black/40
                ring-1 ring-inset ring-slate-100/50 dark:ring-white/[0.04]">
                <div class="flex items-center gap-1.5 px-4 py-3 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02]">
                  <div class="w-2.5 h-2.5 rounded-full bg-rose-400/70"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-amber-400/70"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-emerald-400/70"></div>
                  <span class="ml-3 text-xs font-mono text-slate-500 dark:text-white/40">
                    {{ t('docs.properties.urlLabel') }}
                  </span>
                </div>
                <img :src="canvasShot" :alt="t('docs.properties.alt')"
                  class="block w-full h-auto" loading="lazy" />
              </figure>

              <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-500/[0.08] border border-indigo-200/70 dark:border-indigo-500/20">
                  <SlidersHorizontal class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 class="mt-3 font-heading font-bold text-base text-slate-900 dark:text-white">
                    {{ t('docs.properties.feature1.title') }}
                  </h3>
                  <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-white/65">
                    {{ t('docs.properties.feature1.desc') }}
                  </p>
                </div>
                <div class="p-5 rounded-2xl bg-violet-50/60 dark:bg-violet-500/[0.08] border border-violet-200/70 dark:border-violet-500/20">
                  <SlidersHorizontal class="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  <h3 class="mt-3 font-heading font-bold text-base text-slate-900 dark:text-white">
                    {{ t('docs.properties.feature2.title') }}
                  </h3>
                  <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-white/65">
                    {{ t('docs.properties.feature2.desc') }}
                  </p>
                </div>
              </div>
            </article>

            <!-- Preview -->
            <article id="preview" class="scroll-mt-24">
              <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                05 — {{ t('docs.preview.eyebrow') }}
              </p>
              <h2 class="mt-3 font-heading font-bold tracking-tight
                text-3xl sm:text-4xl text-slate-900 dark:text-white">
                {{ t('docs.preview.title') }}
              </h2>
              <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {{ t('docs.preview.desc') }}
              </p>

              <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                <figure class="rounded-2xl overflow-hidden
                  bg-white dark:bg-[#0d0d14]
                  border border-slate-200 dark:border-white/[0.07]
                  shadow-lg shadow-slate-200/40 dark:shadow-black/40">
                  <img :src="previewDesktopShot" :alt="t('docs.preview.altDesktop')"
                    class="block w-full h-auto" loading="lazy" />
                  <figcaption class="px-4 py-3 text-xs font-mono uppercase tracking-wider
                    text-slate-500 dark:text-white/40
                    border-t border-slate-200 dark:border-white/[0.06]
                    bg-slate-50/80 dark:bg-white/[0.02]
                    flex items-center gap-2">
                    <Eye class="h-3.5 w-3.5" />
                    {{ t('docs.preview.captionDesktop') }}
                  </figcaption>
                </figure>
                <figure class="rounded-2xl overflow-hidden
                  bg-white dark:bg-[#0d0d14]
                  border border-slate-200 dark:border-white/[0.07]
                  shadow-lg shadow-slate-200/40 dark:shadow-black/40">
                  <img :src="previewMobileShot" :alt="t('docs.preview.altMobile')"
                    class="block w-full h-auto" loading="lazy" />
                  <figcaption class="px-4 py-3 text-xs font-mono uppercase tracking-wider
                    text-slate-500 dark:text-white/40
                    border-t border-slate-200 dark:border-white/[0.06]
                    bg-slate-50/80 dark:bg-white/[0.02]
                    flex items-center gap-2">
                    <Eye class="h-3.5 w-3.5" />
                    {{ t('docs.preview.captionMobile') }}
                  </figcaption>
                </figure>
              </div>
            </article>

            <!-- Export -->
            <article id="export" class="scroll-mt-24">
              <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                06 — {{ t('docs.export.eyebrow') }}
              </p>
              <h2 class="mt-3 font-heading font-bold tracking-tight
                text-3xl sm:text-4xl text-slate-900 dark:text-white">
                {{ t('docs.export.title') }}
              </h2>
              <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {{ t('docs.export.desc') }}
              </p>

              <div class="mt-8 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
                <figure class="rounded-2xl overflow-hidden
                  bg-white dark:bg-[#0d0d14]
                  border border-slate-200 dark:border-white/[0.07]
                  shadow-xl shadow-slate-200/40 dark:shadow-black/40">
                  <img :src="exportShot" :alt="t('docs.export.alt')"
                    class="block w-full h-auto" loading="lazy" />
                </figure>
                <ul class="space-y-3">
                  <li v-for="key in ['vue','react','angular']" :key="key"
                    class="flex items-start gap-3 p-4 rounded-xl
                    bg-slate-50 dark:bg-white/[0.03]
                    border border-slate-200 dark:border-white/[0.06]">
                    <Download class="shrink-0 h-4 w-4 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h4 class="font-semibold text-sm text-slate-900 dark:text-white">
                        {{ t(`docs.export.targets.${key}.title`) }}
                      </h4>
                      <p class="mt-1 text-xs leading-relaxed text-slate-600 dark:text-white/55">
                        {{ t(`docs.export.targets.${key}.desc`) }}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </article>

            <!-- AI Prompt -->
            <article id="ai-prompt" class="scroll-mt-24">
              <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                07 — {{ t('docs.aiPrompt.eyebrow') }}
              </p>
              <h2 class="mt-3 font-heading font-bold tracking-tight
                text-3xl sm:text-4xl text-slate-900 dark:text-white">
                {{ t('docs.aiPrompt.title') }}
              </h2>
              <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {{ t('docs.aiPrompt.desc') }}
              </p>

              <figure class="mt-8 rounded-2xl overflow-hidden
                bg-white dark:bg-[#0d0d14]
                border border-slate-200 dark:border-white/[0.07]
                shadow-xl shadow-slate-200/40 dark:shadow-black/40">
                <img :src="promptShot" :alt="t('docs.aiPrompt.alt')"
                  class="block w-full h-auto" loading="lazy" />
              </figure>

              <div class="mt-8 p-5 rounded-2xl
                bg-gradient-to-br from-indigo-50 via-white to-violet-50
                dark:from-indigo-500/[0.08] dark:via-[#0c0c1a] dark:to-violet-500/[0.08]
                border border-indigo-200/70 dark:border-indigo-500/20">
                <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <span class="font-semibold text-indigo-700 dark:text-indigo-300">
                    {{ t('docs.aiPrompt.tip.label') }}
                  </span>
                  {{ t('docs.aiPrompt.tip.body') }}
                </p>
              </div>
            </article>

            <!-- Multi-step -->
            <article id="multistep" class="scroll-mt-24">
              <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                08 — {{ t('docs.multistep.eyebrow') }}
              </p>
              <h2 class="mt-3 font-heading font-bold tracking-tight
                text-3xl sm:text-4xl text-slate-900 dark:text-white">
                {{ t('docs.multistep.title') }}
              </h2>
              <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {{ t('docs.multistep.desc') }}
              </p>

              <!-- Builder canvas screenshot -->
              <figure class="mt-8 rounded-2xl overflow-hidden
                bg-white dark:bg-[#0d0d14]
                border border-slate-200 dark:border-white/[0.07]
                shadow-xl shadow-slate-200/40 dark:shadow-black/40
                ring-1 ring-inset ring-slate-100/50 dark:ring-white/[0.04]">
                <div class="flex items-center gap-1.5 px-4 py-3 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02]">
                  <div class="w-2.5 h-2.5 rounded-full bg-rose-400/70"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-amber-400/70"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-emerald-400/70"></div>
                  <span class="ml-3 text-xs font-mono text-slate-500 dark:text-white/40">
                    {{ t('docs.multistep.urlBuilder') }}
                  </span>
                </div>
                <img :src="multistepBuilderShot" :alt="t('docs.multistep.builder.alt')"
                  class="block w-full h-auto" loading="lazy" />
                <figcaption class="px-4 py-3 text-xs text-slate-500 dark:text-white/40 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02]">
                  {{ t('docs.multistep.builder.caption') }}
                </figcaption>
              </figure>

              <!-- Rule kinds grid -->
              <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="rule in multistepRules" :key="rule.key"
                  :class="['p-5 rounded-2xl border', multistepRuleAccent[rule.accent].wrap]">
                  <component :is="rule.icon"
                    :class="['h-5 w-5', multistepRuleAccent[rule.accent].icon]" />
                  <h3 class="mt-3 font-heading font-bold text-base text-slate-900 dark:text-white">
                    {{ t(`docs.multistep.rules.${rule.key}.title`) }}
                  </h3>
                  <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-white/65">
                    {{ t(`docs.multistep.rules.${rule.key}.desc`) }}
                  </p>
                </div>
              </div>

              <!-- Logic + Preview side-by-side -->
              <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                <figure class="rounded-2xl overflow-hidden
                  bg-white dark:bg-[#0d0d14]
                  border border-slate-200 dark:border-white/[0.07]
                  shadow-lg shadow-slate-200/40 dark:shadow-black/40">
                  <img :src="multistepLogicShot" :alt="t('docs.multistep.logic.alt')"
                    class="block w-full h-auto" loading="lazy" />
                  <figcaption class="px-4 py-3 text-xs text-slate-500 dark:text-white/40 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] flex items-center gap-2">
                    <GitBranch class="h-3.5 w-3.5" />
                    {{ t('docs.multistep.logic.caption') }}
                  </figcaption>
                </figure>
                <figure class="rounded-2xl overflow-hidden
                  bg-white dark:bg-[#0d0d14]
                  border border-slate-200 dark:border-white/[0.07]
                  shadow-lg shadow-slate-200/40 dark:shadow-black/40">
                  <img :src="multistepPreviewShot" :alt="t('docs.multistep.preview.alt')"
                    class="block w-full h-auto" loading="lazy" />
                  <figcaption class="px-4 py-3 text-xs text-slate-500 dark:text-white/40 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] flex items-center gap-2">
                    <Eye class="h-3.5 w-3.5" />
                    {{ t('docs.multistep.preview.caption') }}
                  </figcaption>
                </figure>
              </div>

              <RouterLink to="/builder/multi-step"
                class="mt-8 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white
                  bg-indigo-600 hover:bg-indigo-500
                  dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600
                  dark:hover:from-indigo-400 dark:hover:to-violet-500
                  shadow-md shadow-indigo-500/25
                  transition-all duration-200 hover:-translate-y-0.5 group">
                <Layers class="h-4 w-4" />
                {{ t('docs.multistep.cta') }}
                <ArrowRight class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </RouterLink>
            </article>

            <!-- Final dark sample showcase -->
            <article class="scroll-mt-24">
              <figure class="rounded-2xl overflow-hidden
                border border-slate-200 dark:border-white/[0.07]
                shadow-xl shadow-slate-200/30 dark:shadow-black/40">
                <img :src="propertiesDarkShot" :alt="t('docs.dark.alt')"
                  class="block w-full h-auto" loading="lazy" />
              </figure>
              <p class="mt-3 text-xs text-slate-500 dark:text-white/40 text-center">
                {{ t('docs.dark.caption') }}
              </p>
            </article>

          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>
