<script setup lang="ts">
import { ref, watch } from 'vue'
import { Layers } from 'lucide-vue-next'
import { useMultiStepFormStore } from '../../../stores/multistepForm'
import AppDialog from '../../../components/shared/AppDialog.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const store = useMultiStepFormStore()
const nameInput = ref('')
const saveError = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      nameInput.value = store.formName || ''
      saveError.value = ''
    }
  },
)

async function handleConfirm() {
  const trimmed = nameInput.value.trim()
  if (!trimmed) {
    saveError.value = 'Please enter a name for your form.'
    return
  }
  saveError.value = ''
  try {
    await store.saveToFirestore(trimmed)
    emit('update:open', false)
  } catch {
    saveError.value = 'Failed to save. Please try again.'
  }
}
</script>

<template>
  <AppDialog
    :open="open"
    title="Save Multi-Step Form"
    description="Give your form a name so you can find it later."
    :loading="store.isSaving"
    confirm-text="Save"
    :close-on-backdrop="!store.isSaving"
    @update:open="emit('update:open', $event)"
    @confirm="handleConfirm"
  >
    <template #icon>
      <Layers class="h-5 w-5" />
    </template>

    <div class="mt-1 space-y-3">
      <input
        v-model="nameInput"
        type="text"
        placeholder="e.g. User Onboarding Flow"
        :disabled="store.isSaving"
        class="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-all disabled:opacity-60"
        autofocus
        @keydown.enter="handleConfirm"
      />
      <p v-if="saveError" class="text-sm text-rose-600 dark:text-rose-400">{{ saveError }}</p>
    </div>
  </AppDialog>
</template>
