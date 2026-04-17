<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BuilderNavbar from '../features/builder/BuilderNavbar.vue'
import { Layers } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col h-screen bg-slate-100 dark:bg-[#0d0d14] overflow-hidden">
    <BuilderNavbar />
    <main class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <Layers class="h-7 w-7 text-slate-400 dark:text-white/30" aria-hidden="true" />
        </div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white font-heading mb-2">
          {{ t('builder.nav.forms') }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-white/40">Coming soon</p>
      </div>
    </main>
  </div>
</template>
