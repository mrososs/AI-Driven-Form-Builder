<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Code2, Users, Rocket, Bot } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <section class="relative w-full py-24 sm:py-28">

    <!-- Section header — centered, tight grouping with generous whitespace below -->
    <div class="mx-auto max-w-2xl px-6 text-center">
      <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
        {{ t('audience.eyebrow') }}
      </p>
      <h2 class="mt-3 font-heading font-bold tracking-tight
        text-3xl sm:text-4xl
        text-slate-900 dark:text-white">
        {{ t('audience.title') }}
      </h2>
      <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
        {{ t('audience.subtitle') }}
      </p>
    </div>

    <!-- Persona grid — 1 / 2 / 4 columns with strategic accent variety -->
    <div class="mx-auto mt-14 sm:mt-16 max-w-7xl px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">

        <!-- Frontend Developers — indigo -->
        <div class="group flex flex-col p-6 rounded-2xl
          bg-slate-50 dark:bg-white/[0.03]
          border border-slate-200 dark:border-white/[0.06]
          [box-shadow:0_1px_3px_0_rgba(0,0,0,0.04)] dark:[box-shadow:none]
          hover:border-indigo-300 hover:bg-white
          dark:hover:border-indigo-500/30 dark:hover:bg-indigo-950/20
          hover:shadow-lg hover:shadow-indigo-500/10
          transition-all duration-300">
          <div class="flex items-center justify-center w-11 h-11 rounded-xl
            bg-indigo-50 dark:bg-indigo-500/10
            border border-indigo-200/70 dark:border-indigo-500/20
            group-hover:scale-105 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/15
            transition-all duration-300">
            <Code2 class="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <h3 class="mt-5 font-heading font-bold text-lg leading-tight text-slate-900 dark:text-white">
            {{ t('audience.developers.role') }}
          </h3>
          <p class="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {{ t('audience.developers.stack') }}
          </p>
          <p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {{ t('audience.developers.desc') }}
          </p>
        </div>

        <!-- Technical Team Leads — violet -->
        <div class="group flex flex-col p-6 rounded-2xl
          bg-slate-50 dark:bg-white/[0.03]
          border border-slate-200 dark:border-white/[0.06]
          [box-shadow:0_1px_3px_0_rgba(0,0,0,0.04)] dark:[box-shadow:none]
          hover:border-violet-300 hover:bg-white
          dark:hover:border-violet-500/30 dark:hover:bg-violet-950/20
          hover:shadow-lg hover:shadow-violet-500/10
          transition-all duration-300">
          <div class="flex items-center justify-center w-11 h-11 rounded-xl
            bg-violet-50 dark:bg-violet-500/10
            border border-violet-200/70 dark:border-violet-500/20
            group-hover:scale-105 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/15
            transition-all duration-300">
            <Users class="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
          </div>
          <h3 class="mt-5 font-heading font-bold text-lg leading-tight text-slate-900 dark:text-white">
            {{ t('audience.leads.role') }}
          </h3>
          <p class="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            {{ t('audience.leads.stack') }}
          </p>
          <p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {{ t('audience.leads.desc') }}
          </p>
        </div>

        <!-- Freelancers — sky -->
        <div class="group flex flex-col p-6 rounded-2xl
          bg-slate-50 dark:bg-white/[0.03]
          border border-slate-200 dark:border-white/[0.06]
          [box-shadow:0_1px_3px_0_rgba(0,0,0,0.04)] dark:[box-shadow:none]
          hover:border-sky-300 hover:bg-white
          dark:hover:border-sky-500/30 dark:hover:bg-sky-950/20
          hover:shadow-lg hover:shadow-sky-500/10
          transition-all duration-300">
          <div class="flex items-center justify-center w-11 h-11 rounded-xl
            bg-sky-50 dark:bg-sky-500/10
            border border-sky-200/70 dark:border-sky-500/20
            group-hover:scale-105 group-hover:bg-sky-100 dark:group-hover:bg-sky-500/15
            transition-all duration-300">
            <Rocket class="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          </div>
          <h3 class="mt-5 font-heading font-bold text-lg leading-tight text-slate-900 dark:text-white">
            {{ t('audience.freelancers.role') }}
          </h3>
          <p class="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            {{ t('audience.freelancers.stack') }}
          </p>
          <p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {{ t('audience.freelancers.desc') }}
          </p>
        </div>

        <!-- AI Agent Users — emerald (strategic accent for the differentiator) -->
        <div class="group relative flex flex-col p-6 rounded-2xl
          bg-emerald-50/40 dark:bg-emerald-500/[0.04]
          border border-emerald-200/70 dark:border-emerald-500/20
          [box-shadow:0_1px_3px_0_rgba(0,0,0,0.04)] dark:[box-shadow:none]
          hover:border-emerald-300 hover:bg-emerald-50
          dark:hover:border-emerald-400/40 dark:hover:bg-emerald-500/[0.06]
          hover:shadow-lg hover:shadow-emerald-500/15
          transition-all duration-300">
          <div class="flex items-center justify-center w-11 h-11 rounded-xl
            bg-emerald-50 dark:bg-emerald-500/10
            border border-emerald-200 dark:border-emerald-500/25
            group-hover:scale-105 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/15
            transition-all duration-300">
            <Bot class="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <h3 class="mt-5 font-heading font-bold text-lg leading-tight text-slate-900 dark:text-white">
            {{ t('audience.agentUsers.role') }}
          </h3>
          <p class="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {{ t('audience.agentUsers.stack') }}
          </p>
          <p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {{ t('audience.agentUsers.desc') }}
          </p>
        </div>

      </div>
    </div>
  </section>
</template>
