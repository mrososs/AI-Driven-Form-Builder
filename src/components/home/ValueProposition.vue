<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Wand2, GitFork, Boxes, Check } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <section class="relative w-full py-24 sm:py-32 overflow-hidden">

    <!-- Subtle ambient glow — strategic, not gradient overload -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute top-1/4 -left-32 w-[420px] h-[420px]
        bg-indigo-500/0 dark:bg-indigo-500/[0.07]
        rounded-full blur-[100px]"></div>
      <div class="absolute bottom-1/4 -right-32 w-[420px] h-[420px]
        bg-violet-500/0 dark:bg-violet-500/[0.06]
        rounded-full blur-[100px]"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-6 lg:px-8">

      <!-- Section header — left-aligned for asymmetric variety vs other sections -->
      <div class="max-w-2xl">
        <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          {{ t('value.eyebrow') }}
        </p>
        <h2 class="mt-3 font-heading font-bold tracking-tight
          text-3xl sm:text-4xl lg:text-5xl leading-[1.1]
          text-slate-900 dark:text-white">
          {{ t('value.title') }}
        </h2>
        <p class="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          {{ t('value.subtitle') }}
        </p>
      </div>

      <!-- Zig-zag rows -->
      <div class="mt-20 sm:mt-24 space-y-24 lg:space-y-32">

        <!-- Row A: Prompt Engineering — text left, blueprint visual right -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <!-- Text -->
          <div>
            <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
              bg-indigo-50 dark:bg-indigo-500/10
              text-indigo-700 dark:text-indigo-300
              border border-indigo-200/70 dark:border-indigo-500/20
              text-[11px] font-semibold uppercase tracking-wider">
              <Wand2 class="h-3 w-3" aria-hidden="true" />
              {{ t('value.prompt.chip') }}
            </span>
            <h3 class="mt-4 font-heading font-bold tracking-tight
              text-2xl sm:text-3xl leading-tight
              text-slate-900 dark:text-white">
              {{ t('value.prompt.title') }}
            </h3>
            <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {{ t('value.prompt.desc') }}
            </p>

            <ul class="mt-6 space-y-3">
              <li v-for="key in ['bullet1','bullet2','bullet3']" :key="key" class="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span class="shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full
                  bg-indigo-100 dark:bg-indigo-500/15
                  text-indigo-600 dark:text-indigo-400
                  ring-1 ring-indigo-200/60 dark:ring-indigo-500/25">
                  <Check class="w-3 h-3" aria-hidden="true" />
                </span>
                <span class="leading-relaxed">{{ t(`value.prompt.${key}`) }}</span>
              </li>
            </ul>
          </div>

          <!-- Blueprint visual -->
          <div class="relative">
            <div class="rounded-2xl overflow-hidden
              bg-white dark:bg-[#0b0b16]
              border border-slate-200 dark:border-white/[0.07]
              shadow-xl shadow-indigo-500/5 dark:shadow-black/40
              ring-1 ring-inset ring-slate-100/40 dark:ring-white/[0.03]">

              <!-- Header bar -->
              <div class="flex items-center justify-between px-5 py-3
                border-b border-slate-200 dark:border-white/[0.05]
                bg-slate-50/60 dark:bg-white/[0.02]">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
                  <span class="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {{ t('value.prompt.blueprintLabel') }}
                  </span>
                </div>
                <Wand2 class="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
              </div>

              <!-- Definition list -->
              <dl class="divide-y divide-slate-100 dark:divide-white/[0.05]">
                <div class="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-4 px-5 py-3">
                  <dt class="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-center">
                    {{ t('value.prompt.kSchema') }}
                  </dt>
                  <dd class="font-mono text-sm text-indigo-700 dark:text-indigo-300">
                    {{ t('value.prompt.vSchema') }}
                  </dd>
                </div>
                <div class="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-4 px-5 py-3">
                  <dt class="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-center">
                    {{ t('value.prompt.kState') }}
                  </dt>
                  <dd class="font-mono text-sm text-violet-700 dark:text-violet-300">
                    {{ t('value.prompt.vState') }}
                  </dd>
                </div>
                <div class="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-4 px-5 py-3">
                  <dt class="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-center">
                    {{ t('value.prompt.kUI') }}
                  </dt>
                  <dd class="font-mono text-sm text-sky-700 dark:text-sky-300">
                    {{ t('value.prompt.vUI') }}
                  </dd>
                </div>
                <div class="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-4 px-5 py-3">
                  <dt class="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-center">
                    {{ t('value.prompt.kFields') }}
                  </dt>
                  <dd class="font-mono text-sm text-slate-700 dark:text-slate-300">
                    {{ t('value.prompt.vFields') }}
                  </dd>
                </div>
                <div class="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-4 px-5 py-3">
                  <dt class="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-center">
                    {{ t('value.prompt.kValidation') }}
                  </dt>
                  <dd class="font-mono text-sm text-emerald-700 dark:text-emerald-300">
                    {{ t('value.prompt.vValidation') }}
                  </dd>
                </div>
              </dl>

              <!-- Footer -->
              <div class="px-5 py-3
                border-t border-slate-200 dark:border-white/[0.05]
                bg-slate-50/60 dark:bg-white/[0.02]
                text-[11px] text-slate-500 dark:text-slate-400 italic">
                {{ t('value.prompt.result') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Row B: Cross-Framework Export — visual left, text right -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <!-- Fork visual (mobile: appears second; desktop: first column) -->
          <div class="order-2 lg:order-1">
            <div class="relative rounded-2xl
              bg-white dark:bg-[#0b0b16]
              border border-slate-200 dark:border-white/[0.07]
              shadow-xl shadow-violet-500/5 dark:shadow-black/40
              ring-1 ring-inset ring-slate-100/40 dark:ring-white/[0.03]
              p-8 sm:p-10">

              <!-- Source pill -->
              <div class="mx-auto w-fit flex items-center gap-2 px-4 py-2 rounded-xl
                bg-gradient-to-br from-indigo-500 to-violet-600
                text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20">
                <Boxes class="h-4 w-4" aria-hidden="true" />
                <span class="text-sm font-semibold tracking-tight">{{ t('value.export.source') }}</span>
              </div>

              <!-- Connector lines -->
              <div class="relative h-12 mt-1" aria-hidden="true">
                <svg class="absolute inset-0 w-full h-full" viewBox="0 0 300 48" fill="none" preserveAspectRatio="none">
                  <path d="M150 0 L150 16 L50 32 L50 48"
                    class="stroke-slate-300 dark:stroke-white/20" stroke-width="1" stroke-linecap="round" />
                  <path d="M150 0 L150 48"
                    class="stroke-slate-300 dark:stroke-white/20" stroke-width="1" stroke-linecap="round" />
                  <path d="M150 0 L150 16 L250 32 L250 48"
                    class="stroke-slate-300 dark:stroke-white/20" stroke-width="1" stroke-linecap="round" />
                </svg>
              </div>

              <!-- Three framework targets -->
              <div class="grid grid-cols-3 gap-2 sm:gap-3">
                <div class="flex flex-col items-center gap-2 p-3 rounded-xl
                  bg-rose-50/50 dark:bg-rose-500/[0.06]
                  border border-rose-200/60 dark:border-rose-500/15">
                  <span class="font-mono text-[11px] font-semibold text-rose-700 dark:text-rose-300">.ts</span>
                  <span class="text-[10px] sm:text-xs text-center text-slate-700 dark:text-slate-300 leading-tight font-semibold">
                    {{ t('value.export.angular') }}
                  </span>
                </div>
                <div class="flex flex-col items-center gap-2 p-3 rounded-xl
                  bg-emerald-50/50 dark:bg-emerald-500/[0.06]
                  border border-emerald-200/60 dark:border-emerald-500/15">
                  <span class="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">.vue</span>
                  <span class="text-[10px] sm:text-xs text-center text-slate-700 dark:text-slate-300 leading-tight font-semibold">
                    {{ t('value.export.vue') }}
                  </span>
                </div>
                <div class="flex flex-col items-center gap-2 p-3 rounded-xl
                  bg-sky-50/50 dark:bg-sky-500/[0.06]
                  border border-sky-200/60 dark:border-sky-500/15">
                  <span class="font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-300">.tsx</span>
                  <span class="text-[10px] sm:text-xs text-center text-slate-700 dark:text-slate-300 leading-tight font-semibold">
                    {{ t('value.export.react') }}
                  </span>
                </div>
              </div>

              <p class="mt-6 text-center text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {{ t('value.export.forkLabel') }}
              </p>
            </div>
          </div>

          <!-- Text -->
          <div class="order-1 lg:order-2">
            <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
              bg-violet-50 dark:bg-violet-500/10
              text-violet-700 dark:text-violet-300
              border border-violet-200/70 dark:border-violet-500/20
              text-[11px] font-semibold uppercase tracking-wider">
              <GitFork class="h-3 w-3" aria-hidden="true" />
              {{ t('value.export.chip') }}
            </span>
            <h3 class="mt-4 font-heading font-bold tracking-tight
              text-2xl sm:text-3xl leading-tight
              text-slate-900 dark:text-white">
              {{ t('value.export.title') }}
            </h3>
            <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {{ t('value.export.desc') }}
            </p>
          </div>
        </div>

        <!-- Row C: Developer-centric drag & drop — text left, code visual right -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <!-- Text -->
          <div>
            <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
              bg-emerald-50 dark:bg-emerald-500/10
              text-emerald-700 dark:text-emerald-300
              border border-emerald-200/70 dark:border-emerald-500/20
              text-[11px] font-semibold uppercase tracking-wider">
              <Boxes class="h-3 w-3" aria-hidden="true" />
              {{ t('value.lowCode.chip') }}
            </span>
            <h3 class="mt-4 font-heading font-bold tracking-tight
              text-2xl sm:text-3xl leading-tight
              text-slate-900 dark:text-white">
              {{ t('value.lowCode.title') }}
            </h3>
            <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {{ t('value.lowCode.desc') }}
            </p>

            <ul class="mt-6 space-y-3">
              <li v-for="key in ['bullet1','bullet2','bullet3']" :key="key" class="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span class="shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full
                  bg-emerald-100 dark:bg-emerald-500/15
                  text-emerald-600 dark:text-emerald-400
                  ring-1 ring-emerald-200/60 dark:ring-emerald-500/25">
                  <Check class="w-3 h-3" aria-hidden="true" />
                </span>
                <span class="leading-relaxed">{{ t(`value.lowCode.${key}`) }}</span>
              </li>
            </ul>
          </div>

          <!-- Code visual — clean Angular Signals snippet -->
          <div>
            <div class="rounded-2xl overflow-hidden text-left
              bg-slate-950 dark:bg-[#090912]
              border border-slate-700/40 dark:border-white/[0.07]
              shadow-xl shadow-emerald-500/5 dark:shadow-black/40
              ring-1 ring-inset ring-white/[0.03]">

              <div class="flex items-center justify-between px-5 py-3
                border-b border-slate-700/40 dark:border-white/[0.06]
                bg-slate-900/80 dark:bg-[#0d0d1a]">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span class="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    plan-field.component.ts
                  </span>
                </div>
                <span class="font-mono text-[10px] uppercase tracking-wider text-slate-500">clean output</span>
              </div>

              <pre dir="ltr" class="p-5 sm:p-6 overflow-x-auto text-[13px] font-mono leading-relaxed"><code class="text-slate-300"><span class="text-violet-400">export</span> <span class="text-violet-400">class</span> <span class="text-sky-300">PlanField</span> <span class="text-pink-400">{</span>
  <span class="text-indigo-300">value</span> <span class="text-slate-300">=</span> <span class="text-amber-300">signal</span><span class="text-pink-400">(</span><span class="text-emerald-300">'pro'</span><span class="text-pink-400">)</span>
  <span class="text-indigo-300">seats</span> <span class="text-slate-300">=</span> <span class="text-amber-300">signal</span><span class="text-pink-400">(</span><span class="text-sky-400">3</span><span class="text-pink-400">)</span>

  <span class="text-slate-500">// derived from value()</span>
  <span class="text-indigo-300">showSeats</span> <span class="text-slate-300">=</span> <span class="text-amber-300">computed</span><span class="text-pink-400">(()</span> <span class="text-slate-300">=&gt;</span>
    <span class="text-violet-400">this</span><span class="text-slate-300">.</span><span class="text-amber-300">value</span><span class="text-pink-400">()</span> <span class="text-slate-300">!==</span> <span class="text-emerald-300">'free'</span>
  <span class="text-pink-400">)</span>

  <span class="text-indigo-300">errors</span> <span class="text-slate-300">=</span> <span class="text-amber-300">computed</span><span class="text-pink-400">(()</span> <span class="text-slate-300">=&gt; ({</span>
    <span class="text-indigo-300">seats</span><span class="text-slate-300">:</span> <span class="text-violet-400">this</span><span class="text-slate-300">.</span><span class="text-amber-300">seats</span><span class="text-pink-400">()</span> <span class="text-slate-300">&lt;</span> <span class="text-sky-400">1</span>
      <span class="text-slate-300">?</span> <span class="text-emerald-300">'Need at least 1 seat'</span>
      <span class="text-slate-300">:</span> <span class="text-sky-400">null</span><span class="text-slate-300">,</span>
  <span class="text-slate-300">}))</span>
<span class="text-pink-400">}</span></code></pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
