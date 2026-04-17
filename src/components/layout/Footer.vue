<script setup lang="ts">
import { Github, Twitter, MessageSquare } from 'lucide-vue-next'
</script>

<template>
  <footer class="relative z-10 bg-slate-50/80 dark:bg-white/[0.03] border-t border-slate-200 dark:border-white/[0.07] w-full mt-auto">
    <div class="mx-auto w-full max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
      <div class="flex justify-center gap-x-6 md:order-2">
        <a href="#" class="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200" aria-label="GitHub">
          <Github class="h-5 w-5" />
        </a>
        <a href="#" class="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200" aria-label="Twitter">
          <Twitter class="h-5 w-5" />
        </a>
        <a href="#" class="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200" aria-label="Discord">
          <MessageSquare class="h-5 w-5" />
        </a>
      </div>
      <div class="mt-8 md:order-1 md:mt-0 flex flex-col sm:flex-row gap-4 items-center md:items-start text-center md:text-left text-xs leading-5 text-slate-500 dark:text-slate-500">
        <p>&copy; 2026 FormAI, Inc. All rights reserved.</p>
        <div class="flex gap-4 sm:border-l sm:border-slate-200 dark:sm:border-white/10 sm:pl-4">
          <a href="#" class="hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200">Privacy</a>
          <a href="#" class="hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200">Terms</a>
        </div>
      </div>
    </div>
  </footer>
</template>
