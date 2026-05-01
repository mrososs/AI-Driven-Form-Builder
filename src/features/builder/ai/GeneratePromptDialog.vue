<script setup lang="ts">
import { computed, ref, watch, nextTick, useTemplateRef } from 'vue'
import { Wand2, X, Loader2, AlertCircle, Sparkles, MailWarning, Gauge } from 'lucide-vue-next'
import { useAiQuota } from '../../../composables/useAiQuota'
import { useAuthStore } from '../../../stores/auth'

const props = defineProps<{
  open: boolean
  isGenerating: boolean
  error: string | null
  warnings: string[]
  progressLabel: string
  /** Optional warning shown before submission when current form will be replaced. */
  hasExistingContent?: boolean
  /** Mode label shown in the dialog header. */
  modeLabel?: string
  /** Example prompts shown as chips below the textarea. */
  examples?: string[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [prompt: string]
  cancel: []
}>()

const promptText = ref('')
const textareaRef = useTemplateRef<HTMLTextAreaElement>('textareaRef')

const authStore = useAuthStore()
const quota = useAiQuota()
const verifySending = ref(false)
const verifySent = ref(false)

async function resendVerification() {
  if (verifySending.value) return
  verifySending.value = true
  try {
    await authStore.sendVerification()
    verifySent.value = true
  } finally {
    verifySending.value = false
  }
}

const trimmed = computed(() => promptText.value.trim())
const blockedByVerify = computed(
  () => authStore.isAuthenticated && !quota.emailVerified.value,
)
const blockedByQuota = computed(() => quota.exhausted.value)
const canSubmit = computed(
  () =>
    trimmed.value.length >= 4 &&
    !props.isGenerating &&
    !blockedByVerify.value &&
    !blockedByQuota.value,
)

watch(
  () => props.open,
  async (open) => {
    if (open) {
      promptText.value = ''
      await nextTick()
      textareaRef.value?.focus()
    }
  },
)

function close() {
  if (props.isGenerating) return
  emit('update:open', false)
}

function handleBackdrop(event: MouseEvent) {
  if (event.target === event.currentTarget) close()
}

function submit() {
  if (!canSubmit.value) return
  emit('submit', trimmed.value)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    if (props.isGenerating) emit('cancel')
    else close()
  } else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    submit()
  }
}

function pickExample(text: string) {
  promptText.value = text
  textareaRef.value?.focus()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm"
      @click="handleBackdrop"
      @keydown="handleKeydown"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-form-title"
    >
      <div
        class="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0d0d14]/95 shadow-2xl shadow-indigo-500/10 ring-1 ring-white/5 overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-3 border-b border-white/[0.06]">
          <div class="flex items-start gap-3 min-w-0">
            <div
              class="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30 ring-1 ring-white/10 shrink-0"
            >
              <Wand2 class="h-4 w-4 text-white" />
            </div>
            <div class="min-w-0">
              <h2 id="generate-form-title" class="text-base font-semibold text-white font-heading">
                Generate Form with AI
              </h2>
              <p class="text-xs text-white/50 mt-0.5">
                Describe what you need.
                <span v-if="modeLabel" class="text-indigo-300 font-medium">{{ modeLabel }}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.07] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="isGenerating"
            @click="close"
            aria-label="Close"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-5 sm:px-6 py-4 space-y-3">
          <label for="generate-prompt" class="block text-xs font-medium text-white/70">
            Describe your form
          </label>
          <textarea
            id="generate-prompt"
            ref="textareaRef"
            v-model="promptText"
            rows="5"
            :disabled="isGenerating"
            placeholder="e.g. A customer onboarding form with company details, role, team size, and a free-text 'how did you hear about us' question."
            class="w-full resize-none rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-indigo-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20 outline-none px-3.5 py-2.5 text-sm text-white placeholder-white/30 disabled:opacity-50 transition-colors"
          />
          <div class="flex items-center justify-between text-[11px] text-white/40">
            <span>
              <kbd class="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[10px]">⌘/Ctrl</kbd>
              +
              <kbd class="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[10px]">Enter</kbd>
              to submit
            </span>
            <span>{{ trimmed.length }} / 4000</span>
          </div>

          <!-- Examples -->
          <div v-if="examples && examples.length" class="flex flex-wrap gap-1.5 pt-1">
            <button
              v-for="ex in examples"
              :key="ex"
              type="button"
              :disabled="isGenerating"
              @click="pickExample(ex)"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full border border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] hover:border-white/[0.14] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles class="h-3 w-3 text-indigo-300" />
              {{ ex }}
            </button>
          </div>

          <!-- Quota / verification status -->
          <div
            v-if="blockedByVerify"
            class="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] px-3 py-2 text-[12px] text-amber-200"
          >
            <MailWarning class="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <div class="flex-1">
              <p class="font-medium">Verify your email to use AI generation.</p>
              <p class="mt-0.5 text-amber-200/70">
                We sent a verification link to {{ authStore.user?.email }}. Click it, then refresh.
              </p>
              <button
                type="button"
                class="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 disabled:opacity-50 transition-colors"
                :disabled="verifySending || verifySent"
                @click="resendVerification"
              >
                <Loader2 v-if="verifySending" class="h-3 w-3 animate-spin" />
                <span>{{ verifySent ? 'Verification email sent' : 'Resend verification' }}</span>
              </button>
            </div>
          </div>

          <div
            v-else-if="quota.ready.value"
            class="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px]"
            :class="blockedByQuota ? 'text-rose-300' : 'text-white/60'"
          >
            <Gauge class="h-3 w-3 shrink-0" :class="blockedByQuota ? 'text-rose-400' : 'text-indigo-300'" />
            <span class="flex-1">
              AI generations today: <span class="font-semibold text-white/80">{{ quota.used.value }} of {{ quota.limit }}</span>
            </span>
            <span v-if="blockedByQuota" class="text-rose-300/80">Resets at 00:00 UTC</span>
          </div>

          <!-- Replacement notice -->
          <div
            v-if="hasExistingContent && !isGenerating && !error && !blockedByVerify && !blockedByQuota"
            class="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-[12px] text-amber-200"
          >
            <AlertCircle class="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>This will replace your current form. Save first if you want to keep it.</span>
          </div>

          <!-- Progress -->
          <div
            v-if="isGenerating"
            class="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] px-3 py-2 text-[12px] text-indigo-200"
          >
            <Loader2 class="h-3.5 w-3.5 animate-spin shrink-0" />
            <span>{{ progressLabel || 'Generating…' }}</span>
          </div>

          <!-- Warnings -->
          <ul
            v-if="warnings.length"
            class="space-y-1 text-[11px] text-amber-300/80 max-h-24 overflow-y-auto"
          >
            <li v-for="(w, idx) in warnings" :key="idx" class="flex items-start gap-1.5">
              <span class="mt-1 inline-block h-1 w-1 rounded-full bg-amber-300/70 shrink-0" />
              <span>{{ w }}</span>
            </li>
          </ul>

          <!-- Error -->
          <div
            v-if="error"
            class="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/[0.08] px-3 py-2 text-[12px] text-rose-200"
          >
            <AlertCircle class="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{{ error }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
          <button
            type="button"
            class="px-3 py-1.5 text-sm rounded-lg text-white/70 hover:text-white hover:bg-white/[0.07] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="isGenerating"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            :disabled="!canSubmit"
            @click="submit"
          >
            <Loader2 v-if="isGenerating" class="h-3.5 w-3.5 animate-spin" />
            <Wand2 v-else class="h-3.5 w-3.5" />
            <span>{{ isGenerating ? 'Generating…' : 'Generate' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
