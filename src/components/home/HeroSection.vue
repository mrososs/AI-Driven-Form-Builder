<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Sparkles, ArrowRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const { t } = useI18n()

const activeTab = ref('schema.json')
const tabs = ['schema.json', 'model.ts', 'Form.vue', 'Form.tsx', 'form.component.ts']
</script>

<template>
  <div class="relative w-full pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pb-36 overflow-hidden">

    <!-- Ambient glow — vivid in dark, barely-there in light -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div class="absolute -top-32 -left-24 w-[580px] h-[580px]
        bg-indigo-500/8 dark:bg-indigo-500/30
        rounded-full blur-[110px]"></div>
      <div class="absolute -top-16 right-0 w-[480px] h-[480px]
        bg-violet-500/6 dark:bg-violet-500/22
        rounded-full blur-[90px]"></div>
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2
        w-[700px] h-[220px]
        bg-indigo-400/4 dark:bg-indigo-400/8
        rounded-full blur-[60px]"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">

      <!-- Badge -->
      <a href="#"
        class="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm
          ring-1 ring-slate-200 dark:ring-white/[0.1]
          hover:ring-indigo-400/60 dark:hover:ring-indigo-500/40
          bg-white/70 dark:bg-white/[0.04]
          hover:bg-indigo-50/60 dark:hover:bg-indigo-500/[0.08]
          backdrop-blur-sm shadow-sm dark:shadow-none
          transition-all duration-200 group">
        <span class="font-semibold text-indigo-600 dark:text-indigo-400 text-xs uppercase tracking-wide">{{ t('hero.badge') }}</span>
        <span class="w-px h-3.5 bg-slate-200 dark:bg-white/15 shrink-0"></span>
        <span class="text-slate-600 dark:text-slate-300 text-sm">{{ t('hero.badgeText') }}</span>
        <Sparkles class="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0 group-hover:rotate-12 transition-transform duration-200" />
      </a>

      <!-- Headline -->
      <h1 class="mt-8 max-w-4xl font-extrabold tracking-tight font-heading
        text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.08]">
        <span class="text-slate-900 dark:text-white">{{ t('hero.titleP1') }}</span>
        <span class="mt-1 block
          bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500
          dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400
          bg-clip-text text-transparent pb-1">
          {{ t('hero.titleGradient') }}
        </span>
      </h1>

      <!-- Description -->
      <p class="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-500 dark:text-slate-400">
        {{ t('hero.description') }}
      </p>

      <!-- CTA Buttons -->
      <div class="mt-10 flex flex-wrap items-center gap-3 sm:gap-4 justify-center">
        <RouterLink
          to="/builder"
          class="group flex items-center gap-2 px-6 py-3 text-sm sm:text-base font-semibold rounded-xl text-white
            bg-indigo-600 hover:bg-indigo-500
            dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600
            dark:hover:from-indigo-400 dark:hover:to-violet-500
            shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/30
            hover:shadow-xl hover:shadow-indigo-500/35
            transition-all duration-200 hover:-translate-y-0.5"
        >
          {{ t('hero.cta') }}
          <ArrowRight class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </RouterLink>

        <a
          href="#"
          class="flex items-center gap-2 px-6 py-3 text-sm sm:text-base font-semibold rounded-xl
            text-slate-700 dark:text-white/80
            bg-white dark:bg-white/[0.05]
            border border-slate-200 dark:border-white/[0.09]
            hover:bg-slate-50 dark:hover:bg-white/[0.09]
            hover:border-slate-300 dark:hover:border-white/[0.16]
            hover:text-slate-900 dark:hover:text-white
            transition-all duration-200 hover:-translate-y-0.5"
        >
          {{ t('nav.docs') }}
        </a>
      </div>

      <!-- Code Block -->
      <div class="mt-20 w-full max-w-3xl text-left
        rounded-2xl overflow-hidden
        bg-slate-950 dark:bg-[#090912]
        border border-slate-700/50 dark:border-white/[0.07]
        shadow-2xl shadow-black/25 dark:shadow-black/70
        ring-1 ring-inset ring-white/[0.04]">

        <!-- Browser chrome bar -->
        <div class="flex items-center gap-3 px-5 py-3
          border-b border-slate-700/50 dark:border-white/[0.06]
          bg-slate-900/80 dark:bg-[#0d0d1a]">
          <!-- Traffic lights -->
          <div class="flex gap-1.5 shrink-0">
            <div class="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
            <div class="w-3 h-3 rounded-full bg-[#febc2e]"></div>
            <div class="w-3 h-3 rounded-full bg-[#28c840]"></div>
          </div>
          <!-- Tabs -->
          <div class="flex-1 min-w-0 flex justify-center gap-4 text-xs font-mono overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab"
              type="button"
              @click="activeTab = tab"
              class="shrink-0 bg-transparent border-x-0 border-t-0 p-0 pb-px outline-none cursor-pointer whitespace-nowrap transition-colors"
              :class="activeTab === tab
                ? 'text-indigo-400 border-b border-indigo-400/60 '
                : 'text-slate-500 hover:text-slate-400'"
            >{{ tab }}</button>
          </div>
          <div class="shrink-0 w-[52px]"></div>
        </div>

        <!-- Code content -->
        <div class="p-6 md:p-8 overflow-x-auto text-sm font-mono leading-relaxed min-h-[260px]">

          <!-- schema.json -->
          <pre v-show="activeTab === 'schema.json'"><code class="text-slate-300"><span class="text-pink-400">{</span>
  <span class="text-indigo-300">"name"</span><span class="text-pink-400">:</span> <span class="text-emerald-300">"User Onboarding"</span><span class="text-slate-500">,</span>
  <span class="text-indigo-300">"description"</span><span class="text-pink-400">:</span> <span class="text-emerald-300">"Collect basic profile and workspace details."</span><span class="text-slate-500">,</span>
  <span class="text-indigo-300">"fields"</span><span class="text-pink-400">:</span> <span class="text-violet-400">[</span>
    <span class="text-amber-300">{</span>
      <span class="text-indigo-300">"id"</span><span class="text-pink-400">:</span> <span class="text-emerald-300">"email"</span><span class="text-slate-500">,</span>
      <span class="text-indigo-300">"type"</span><span class="text-pink-400">:</span> <span class="text-emerald-300">"email"</span><span class="text-slate-500">,</span>
      <span class="text-indigo-300">"validation"</span><span class="text-pink-400">:</span> <span class="text-purple-400">{</span> <span class="text-indigo-300">"required"</span><span class="text-pink-400">:</span> <span class="text-sky-400">true</span><span class="text-slate-500">,</span> <span class="text-indigo-300">"domain"</span><span class="text-pink-400">:</span> <span class="text-emerald-300">"@company.com"</span> <span class="text-purple-400">}</span>
    <span class="text-amber-300">}</span><span class="text-slate-500">,</span>
    <span class="text-amber-300">{</span>
      <span class="text-indigo-300">"id"</span><span class="text-pink-400">:</span> <span class="text-emerald-300">"company_size"</span><span class="text-slate-500">,</span>
      <span class="text-indigo-300">"type"</span><span class="text-pink-400">:</span> <span class="text-emerald-300">"select"</span><span class="text-slate-500">,</span>
      <span class="text-indigo-300">"options"</span><span class="text-pink-400">:</span> <span class="text-emerald-300">["1-10", "11-50", "50+"]</span>
    <span class="text-amber-300">}</span>
  <span class="text-violet-400">]</span>
<span class="text-pink-400">}</span></code></pre>

          <!-- model.ts -->
          <pre v-show="activeTab === 'model.ts'"><code class="text-slate-300"><span class="text-violet-400">import</span> <span class="text-violet-400">type</span> <span class="text-pink-400">{</span> <span class="text-sky-300">FormSchema</span> <span class="text-pink-400">}</span> <span class="text-violet-400">from</span> <span class="text-emerald-300">'@formai/core'</span>

<span class="text-violet-400">export const</span> <span class="text-sky-300">onboardingSchema</span><span class="text-slate-300">:</span> <span class="text-sky-400">FormSchema</span> <span class="text-slate-300">=</span> <span class="text-pink-400">{</span>
  <span class="text-indigo-300">name</span><span class="text-slate-300">:</span> <span class="text-emerald-300">'User Onboarding'</span><span class="text-slate-500">,</span>
  <span class="text-indigo-300">fields</span><span class="text-slate-300">:</span> <span class="text-violet-400">[</span>
    <span class="text-amber-300">{</span>
      <span class="text-indigo-300">id</span><span class="text-slate-300">:</span> <span class="text-emerald-300">'email'</span><span class="text-slate-500">,</span> <span class="text-indigo-300">type</span><span class="text-slate-300">:</span> <span class="text-emerald-300">'email'</span><span class="text-slate-500">,</span>
      <span class="text-indigo-300">label</span><span class="text-slate-300">:</span> <span class="text-emerald-300">'Work Email'</span><span class="text-slate-500">,</span>
      <span class="text-indigo-300">validation</span><span class="text-slate-300">:</span> <span class="text-purple-400">{</span> <span class="text-indigo-300">required</span><span class="text-slate-300">:</span> <span class="text-sky-400">true</span> <span class="text-purple-400">}</span><span class="text-slate-500">,</span>
    <span class="text-amber-300">}</span><span class="text-slate-500">,</span>
    <span class="text-amber-300">{</span>
      <span class="text-indigo-300">id</span><span class="text-slate-300">:</span> <span class="text-emerald-300">'company_size'</span><span class="text-slate-500">,</span> <span class="text-indigo-300">type</span><span class="text-slate-300">:</span> <span class="text-emerald-300">'select'</span><span class="text-slate-500">,</span>
      <span class="text-indigo-300">label</span><span class="text-slate-300">:</span> <span class="text-emerald-300">'Company Size'</span><span class="text-slate-500">,</span>
      <span class="text-indigo-300">options</span><span class="text-slate-300">:</span> <span class="text-violet-400">[</span><span class="text-emerald-300">'1-10'</span><span class="text-slate-500">,</span> <span class="text-emerald-300">'11-50'</span><span class="text-slate-500">,</span> <span class="text-emerald-300">'50+'</span><span class="text-violet-400">]</span><span class="text-slate-500">,</span>
    <span class="text-amber-300">}</span><span class="text-slate-500">,</span>
  <span class="text-violet-400">]</span><span class="text-slate-500">,</span>
<span class="text-pink-400">}</span></code></pre>

          <!-- Form.vue -->
          <pre v-show="activeTab === 'Form.vue'"><code class="text-slate-300"><span class="text-pink-400">&lt;script</span> <span class="text-sky-300">setup</span> <span class="text-sky-300">lang</span><span class="text-slate-300">=</span><span class="text-emerald-300">"ts"</span><span class="text-pink-400">&gt;</span>
<span class="text-violet-400">import</span> <span class="text-pink-400">{</span> <span class="text-sky-300">FormAI</span> <span class="text-pink-400">}</span> <span class="text-violet-400">from</span> <span class="text-emerald-300">'@formai/vue'</span>
<span class="text-violet-400">import</span> <span class="text-pink-400">{</span> <span class="text-sky-300">onboardingSchema</span> <span class="text-pink-400">}</span> <span class="text-violet-400">from</span> <span class="text-emerald-300">'./model'</span>

<span class="text-violet-400">const</span> <span class="text-amber-300">handleSubmit</span> <span class="text-slate-300">= (</span><span class="text-slate-300">data</span><span class="text-slate-300">:</span> <span class="text-sky-400">Record</span><span class="text-slate-500">&lt;</span><span class="text-sky-400">string</span><span class="text-slate-500">,</span> <span class="text-sky-400">unknown</span><span class="text-slate-500">&gt;</span><span class="text-slate-300">) =&gt; {</span>
  <span class="text-sky-300">console</span><span class="text-slate-300">.</span><span class="text-amber-300">log</span><span class="text-pink-400">(</span><span class="text-emerald-300">'Submitted:'</span><span class="text-slate-500">,</span> <span class="text-slate-300">data</span><span class="text-pink-400">)</span>
<span class="text-slate-300">}</span>
<span class="text-pink-400">&lt;/script&gt;</span>

<span class="text-pink-400">&lt;template&gt;</span>
  <span class="text-amber-300">&lt;FormAI</span>
    <span class="text-sky-300">:schema</span><span class="text-slate-300">=</span><span class="text-emerald-300">"onboardingSchema"</span>
    <span class="text-sky-300">@submit</span><span class="text-slate-300">=</span><span class="text-emerald-300">"handleSubmit"</span>
  <span class="text-amber-300">/&gt;</span>
<span class="text-pink-400">&lt;/template&gt;</span></code></pre>

          <!-- Form.tsx (React) -->
          <pre v-show="activeTab === 'Form.tsx'"><code class="text-slate-300"><span class="text-violet-400">import</span> <span class="text-pink-400">{</span> <span class="text-sky-300">FormAI</span> <span class="text-pink-400">}</span> <span class="text-violet-400">from</span> <span class="text-emerald-300">'@formai/react'</span>
<span class="text-violet-400">import</span> <span class="text-pink-400">{</span> <span class="text-sky-300">onboardingSchema</span> <span class="text-pink-400">}</span> <span class="text-violet-400">from</span> <span class="text-emerald-300">'./model'</span>

<span class="text-violet-400">export function</span> <span class="text-amber-300">OnboardingForm</span><span class="text-slate-300">() {</span>
  <span class="text-violet-400">return</span> <span class="text-slate-300">(</span>
    <span class="text-amber-300">&lt;FormAI</span>
      <span class="text-sky-300">schema</span><span class="text-slate-300">={</span><span class="text-sky-300">onboardingSchema</span><span class="text-slate-300">}</span>
      <span class="text-sky-300">onSubmit</span><span class="text-slate-300">={(</span><span class="text-slate-300">data</span><span class="text-slate-300">) =&gt;</span>
        <span class="text-sky-300">console</span><span class="text-slate-300">.</span><span class="text-amber-300">log</span><span class="text-pink-400">(</span><span class="text-emerald-300">'Submitted:'</span><span class="text-slate-500">,</span> <span class="text-slate-300">data</span><span class="text-pink-400">)</span>
      <span class="text-slate-300">}</span>
    <span class="text-amber-300">/&gt;</span>
  <span class="text-slate-300">)</span>
<span class="text-slate-300">}</span></code></pre>

          <!-- form.component.ts (Angular) -->
          <pre v-show="activeTab === 'form.component.ts'"><code class="text-slate-300"><span class="text-violet-400">import</span> <span class="text-pink-400">{</span> <span class="text-sky-300">Component</span> <span class="text-pink-400">}</span> <span class="text-violet-400">from</span> <span class="text-emerald-300">'@angular/core'</span>
<span class="text-violet-400">import</span> <span class="text-pink-400">{</span> <span class="text-sky-300">FormAIModule</span> <span class="text-pink-400">}</span> <span class="text-violet-400">from</span> <span class="text-emerald-300">'@formai/angular'</span>
<span class="text-violet-400">import</span> <span class="text-pink-400">{</span> <span class="text-sky-300">onboardingSchema</span> <span class="text-pink-400">}</span> <span class="text-violet-400">from</span> <span class="text-emerald-300">'./model'</span>

<span class="text-amber-300">@Component</span><span class="text-slate-300">({</span>
  <span class="text-indigo-300">selector</span><span class="text-slate-300">:</span> <span class="text-emerald-300">'app-onboarding'</span><span class="text-slate-500">,</span>
  <span class="text-indigo-300">imports</span><span class="text-slate-300">:</span> <span class="text-violet-400">[</span><span class="text-sky-300">FormAIModule</span><span class="text-violet-400">]</span><span class="text-slate-500">,</span>
  <span class="text-indigo-300">template</span><span class="text-slate-300">: `</span>
    <span class="text-pink-400">&lt;form-ai</span>
      <span class="text-sky-300">[schema]</span><span class="text-slate-300">=</span><span class="text-emerald-300">"schema"</span>
      <span class="text-sky-300">(formSubmit)</span><span class="text-slate-300">=</span><span class="text-emerald-300">"onSubmit($event)"</span>
    <span class="text-pink-400">/&gt;</span>
  <span class="text-slate-300">`,</span>
<span class="text-slate-300">})</span>
<span class="text-violet-400">export class</span> <span class="text-sky-300">OnboardingComponent</span> <span class="text-slate-300">{</span>
  <span class="text-indigo-300">schema</span> <span class="text-slate-300">=</span> <span class="text-sky-300">onboardingSchema</span>

  <span class="text-amber-300">onSubmit</span><span class="text-slate-300">(</span><span class="text-slate-300">data</span><span class="text-slate-300">:</span> <span class="text-sky-400">Record</span><span class="text-slate-500">&lt;</span><span class="text-sky-400">string</span><span class="text-slate-500">,</span> <span class="text-sky-400">unknown</span><span class="text-slate-500">&gt;</span><span class="text-slate-300">) {</span>
    <span class="text-sky-300">console</span><span class="text-slate-300">.</span><span class="text-amber-300">log</span><span class="text-pink-400">(</span><span class="text-emerald-300">'Submitted:'</span><span class="text-slate-500">,</span> <span class="text-slate-300">data</span><span class="text-pink-400">)</span>
  <span class="text-slate-300">}</span>
<span class="text-slate-300">}</span></code></pre>

        </div>
      </div>

    </div>
  </div>
</template>
