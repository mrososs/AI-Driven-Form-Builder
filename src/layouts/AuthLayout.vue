<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-[#08080f] relative overflow-hidden">
    <!-- Ambient glow blobs -->
    <div class="pointer-events-none absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.12] blur-[120px]" />
    <div class="pointer-events-none absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/[0.10] blur-[100px]" />

    <!-- Grid pattern overlay -->
    <div class="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(to_right,var(--grid-line)_1px,transparent_1px)] [background-size:64px_64px] opacity-[0.04]" />

    <!-- Logo -->
    <div class="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
      <RouterLink to="/" class="flex items-center gap-2.5 group">
        <div class="flex items-center justify-center w-8 h-8 rounded-xl
          bg-gradient-to-br from-indigo-500 to-violet-600
          shadow-lg shadow-indigo-500/30
          ring-1 ring-white/20
          group-hover:shadow-indigo-500/50 transition-all duration-200 group-hover:scale-105">
          <Sparkles class="h-4 w-4 text-white" />
        </div>
        <span class="font-bold text-lg tracking-tight text-white font-heading">FormAI</span>
      </RouterLink>
    </div>

    <!-- Centered content -->
    <div class="relative z-10 flex items-center justify-center min-h-screen px-4 py-24">
      <slot />
    </div>
  </div>
</template>
