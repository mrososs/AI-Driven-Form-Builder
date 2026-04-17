<script setup lang="ts">
import BuilderSidebar from '../features/builder/BuilderSidebar.vue'
import BuilderCanvas from '../features/builder/BuilderCanvas.vue'
import BuilderProperties from '../features/builder/BuilderProperties.vue'
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <BuilderSidebar />
    <BuilderCanvas />
    <BuilderProperties />
  </div>
</template>
