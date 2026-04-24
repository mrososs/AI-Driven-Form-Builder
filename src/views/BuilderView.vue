<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFormStore } from '../stores/form'
import BuilderNavbar from '../features/builder/BuilderNavbar.vue'
import BuilderSidebar from '../features/builder/BuilderSidebar.vue'
import BuilderCanvas from '../features/builder/BuilderCanvas.vue'
import BuilderProperties from '../features/builder/BuilderProperties.vue'
import BuilderMobileTabs from '../features/builder/BuilderMobileTabs.vue'

const route = useRoute()
const formStore = useFormStore()

watch(
  () => route.query.id,
  (id) => {
    if (typeof id === 'string' && id && id !== formStore.currentFormId) {
      formStore.loadFormById(id)
    } else if (!id && formStore.currentFormId) {
      // Navigated back to a clean builder — reset to a new draft.
      formStore.clearDraft()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex flex-col h-screen bg-slate-100 dark:bg-[#0d0d14] overflow-hidden">
    <BuilderNavbar />
    <div class="flex flex-1 min-h-0 overflow-hidden pb-[52px] md:pb-0">
      <BuilderSidebar />
      <BuilderCanvas />
      <BuilderProperties />
    </div>
    <BuilderMobileTabs />
  </div>
</template>
