<script setup lang="ts">
import BuilderNavbar from '../features/builder/BuilderNavbar.vue'
import BuilderSidebar from '../features/builder/BuilderSidebar.vue'
import BuilderCanvas from '../features/builder/BuilderCanvas.vue'
import BuilderProperties from '../features/builder/BuilderProperties.vue'
</script>

<template>
  <div class="flex flex-col h-screen bg-slate-100 dark:bg-[#0d0d14] overflow-hidden">
    <BuilderNavbar />
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <BuilderSidebar />
      <BuilderCanvas />
      <BuilderProperties />
    </div>
  </div>
</template>
