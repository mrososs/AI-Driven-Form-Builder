<script setup lang="ts">
import vueLogo from '../../assets/logos/vue-js.png'
import reactLogo from '../../assets/logos/React-icon.svg.png'
import angularLogo from '../../assets/logos/Angular A Letter New 2024.png'
</script>

<template>
  <div class="py-16 sm:py-20 w-full">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">

      <!-- Divider label -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-slate-200 dark:border-white/5"></div>
        </div>
        <div class="relative flex justify-center">
          <span class="px-4 bg-white dark:bg-[#08080f] text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
            Works with your favorite framework
          </span>
        </div>
      </div>

      <!-- Framework cards -->
      <div class="mt-12 flex flex-wrap justify-center items-stretch gap-6">

        <!-- Vue -->
        <div class="group flex flex-col items-center gap-4 px-10 py-8 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:border-[#42b883]/40 dark:hover:border-[#42b883]/30 hover:bg-[#42b883]/5 dark:hover:bg-[#42b883]/5 transition-all duration-300 cursor-default select-none min-w-[180px]">
          <img :src="vueLogo" alt="Vue logo" class="w-14 h-14 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
          <div class="text-center">
            <p class="text-base font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#42b883] transition-colors duration-300">Vue</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Vue 3 / Composition API</p>
          </div>
        </div>

        <!-- React -->
        <div class="group flex flex-col items-center gap-4 px-10 py-8 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:border-[#61dafb]/40 dark:hover:border-[#61dafb]/30 hover:bg-[#61dafb]/5 dark:hover:bg-[#61dafb]/5 transition-all duration-300 cursor-default select-none min-w-[180px]">
          <img :src="reactLogo" alt="React logo" class="w-14 h-14 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
          <div class="text-center">
            <p class="text-base font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#61dafb] transition-colors duration-300">React</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">React 18 / Hooks</p>
          </div>
        </div>

        <!-- Angular -->
        <div class="group flex flex-col items-center gap-4 px-10 py-8 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:border-[#dd0031]/40 dark:hover:border-[#dd0031]/30 hover:bg-[#dd0031]/5 dark:hover:bg-[#dd0031]/5 transition-all duration-300 cursor-default select-none min-w-[180px]">
          <img :src="angularLogo" alt="Angular logo" class="w-14 h-14 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
          <div class="text-center">
            <p class="text-base font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#dd0031] transition-colors duration-300">Angular</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Angular 17+</p>
          </div>
        </div>

      </div>

      <!-- Subtitle -->
      <p class="mt-8 text-center text-sm text-slate-400 dark:text-slate-600">
        One API — drop it into any frontend stack
      </p>

    </div>
  </div>
</template>
