<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useMultiStepFormStore } from '../stores/multistepForm'
import MultiStepNavbar from '../features/multistep/components/MultiStepNavbar.vue'
import StepRail from '../features/multistep/components/StepRail.vue'
import ElementsSidebar from '../features/multistep/components/ElementsSidebar.vue'
import MultiStepCanvas from '../features/multistep/components/MultiStepCanvas.vue'
import EmptyCanvas from '../features/multistep/components/EmptyCanvas.vue'
import PropertiesPanel from '../features/multistep/components/PropertiesPanel.vue'
import PreviewMode from '../features/multistep/components/PreviewMode.vue'
import LogicPage from '../features/multistep/components/LogicPage.vue'
import MultiStepExportDialog from '../features/multistep/components/MultiStepExportDialog.vue'
import MultiStepSaveDialog from '../features/multistep/components/MultiStepSaveDialog.vue'
import MultiStepMobileTabs from '../features/multistep/components/MultiStepMobileTabs.vue'
import { useMultiStepUI } from '../features/multistep/composables/useMultiStepUI'

const store = useMultiStepFormStore()
const route = useRoute()
const { mode, setMode } = useMultiStepUI()
const exportOpen = ref(false)
const saveDialogOpen = ref(false)

onMounted(async () => {
  const id = route.query.id as string | undefined
  if (id && id !== store.currentFormId) {
    await store.loadFormById(id)
  }
})

onBeforeUnmount(() => {
  store.saveDraft()
})

watch(
  () => [store.steps, store.progressStyle, store.flow, store.rules],
  () => {
    store.saveDraft()
  },
  { deep: true }
)

function handleSave() {
  saveDialogOpen.value = true
}

function openExport() {
  exportOpen.value = true
}

function exitToBuilder() {
  setMode('build')
}
</script>

<template>
  <div
    class="ms-scene h-screen w-screen flex flex-col text-slate-900 dark:text-white overflow-hidden"
  >
    <MultiStepNavbar
      :mode="mode"
      :form-name="store.formName"
      @update:mode="setMode($event)"
      @export="openExport"
      @save="handleSave"
    />

    <div v-if="mode === 'build'" class="flex-1 min-h-0 flex pb-[52px] lg:pb-0">
      <StepRail />
      <ElementsSidebar v-if="store.steps.length > 0" />
      <MultiStepCanvas v-if="store.steps.length > 0" />
      <EmptyCanvas v-else />
      <PropertiesPanel v-if="store.steps.length > 0" />
    </div>

    <PreviewMode v-else-if="mode === 'preview'" @exit="exitToBuilder" />
    <LogicPage v-else @exit="exitToBuilder" />

    <MultiStepMobileTabs v-if="mode === 'build'" />
    <MultiStepExportDialog v-model:open="exportOpen" />
    <MultiStepSaveDialog v-model:open="saveDialogOpen" />
  </div>
</template>

<style>
.ms-scene {
  background:
    radial-gradient(1200px 600px at 10% -10%, rgba(99, 102, 241, 0.05), transparent 60%),
    radial-gradient(900px 500px at 100% 0%, rgba(139, 92, 246, 0.04), transparent 55%),
    #f8fafc;
}

.dark .ms-scene {
  background:
    radial-gradient(1200px 600px at 10% -10%, rgba(99, 102, 241, 0.1), transparent 60%),
    radial-gradient(900px 500px at 100% 0%, rgba(139, 92, 246, 0.08), transparent 55%),
    #0a0a0f;
}

.ms-scene .scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.ms-scene .scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.15);
  border-radius: 999px;
}

.ms-scene .scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.dark .ms-scene .scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
}
</style>
