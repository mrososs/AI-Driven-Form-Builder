<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Sparkles, Database, Zap } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 lg:px-8 pb-32">
    <div class="mx-auto max-w-2xl lg:text-center">
      <h2 class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{{ t('features.title') }}</h2>
      <p class="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl font-heading">{{ t('features.subtitle') }}</p>
    </div>

    <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
      <div class="grid max-w-xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">

        <!-- Card 1: Generative Forms — indigo -->
        <div class="flex flex-col group p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 [box-shadow:0_1px_4px_0_rgba(0,0,0,0.06)]  dark:[box-shadow:none] hover:border-indigo-300 dark:hover:bg-indigo-950/30 dark:hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
          <div class="flex items-center gap-x-4 mb-6">
            <div class="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all duration-300">
              <Sparkles class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 class="text-lg font-bold leading-7 text-slate-900 dark:text-white font-heading">
              {{ t('features.ai.title') }}
            </h3>
          </div>
          <p class="flex-auto text-sm leading-7 text-slate-600 dark:text-slate-400">
            {{ t('features.ai.description') }}
          </p>
        </div>

        <!-- Card 2: Structured Data — violet -->
        <div class="flex flex-col group p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 [box-shadow:0_1px_4px_0_rgba(0,0,0,0.06)]  dark:[box-shadow:none] hover:border-violet-300 dark:hover:bg-violet-950/30 dark:hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
          <div class="flex items-center gap-x-4 mb-6">
            <div class="p-3 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 group-hover:scale-110 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 transition-all duration-300">
              <Database class="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 class="text-lg font-bold leading-7 text-slate-900 dark:text-white font-heading">
              {{ t('features.drag.title') }}
            </h3>
          </div>
          <p class="flex-auto text-sm leading-7 text-slate-600 dark:text-slate-400">
            {{ t('features.drag.description') }}
          </p>
        </div>

        <!-- Card 3: Streaming Validation — emerald -->
        <div class="flex flex-col group p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 [box-shadow:0_1px_4px_0_rgba(0,0,0,0.06)]  dark:[box-shadow:none] hover:border-emerald-300 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
          <div class="flex items-center gap-x-4 mb-6">
            <div class="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-all duration-300">
              <Zap class="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 class="text-lg font-bold leading-7 text-slate-900 dark:text-white font-heading">
              {{ t('features.layout.title') }}
            </h3>
          </div>
          <p class="flex-auto text-sm leading-7 text-slate-600 dark:text-slate-400">
            {{ t('features.layout.description') }}
          </p>
        </div>

      </div>
    </div>
  </div>
</template>
