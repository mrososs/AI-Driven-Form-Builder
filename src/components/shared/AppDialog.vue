<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { X, AlertTriangle, Info, CheckCircle2 } from 'lucide-vue-next'

type DialogVariant = 'default' | 'danger' | 'warning' | 'info' | 'success'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
    variant?: DialogVariant
    confirmText?: string
    cancelText?: string
    loading?: boolean
    closeOnBackdrop?: boolean
    hideClose?: boolean
    hideFooter?: boolean
    hideIcon?: boolean
    maxWidth?: string
  }>(),
  {
    variant: 'default',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    loading: false,
    closeOnBackdrop: true,
    hideClose: false,
    hideFooter: false,
    hideIcon: false,
    maxWidth: 'max-w-md',
  }
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const panelRef = ref<HTMLElement | null>(null)
const lastFocused = ref<HTMLElement | null>(null)

const variantStyles = computed(() => {
  switch (props.variant) {
    case 'danger':
      return {
        iconWrap:
          'bg-rose-500/10 ring-rose-500/20 text-rose-600 dark:text-rose-400',
        confirmBtn:
          'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500 shadow-rose-500/25',
        Icon: AlertTriangle,
      }
    case 'warning':
      return {
        iconWrap:
          'bg-amber-500/10 ring-amber-500/20 text-amber-600 dark:text-amber-400',
        confirmBtn:
          'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500 shadow-amber-500/25',
        Icon: AlertTriangle,
      }
    case 'success':
      return {
        iconWrap:
          'bg-emerald-500/10 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        confirmBtn:
          'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-emerald-500/25',
        Icon: CheckCircle2,
      }
    case 'info':
      return {
        iconWrap:
          'bg-sky-500/10 ring-sky-500/20 text-sky-600 dark:text-sky-400',
        confirmBtn:
          'bg-sky-600 hover:bg-sky-700 focus-visible:ring-sky-500 shadow-sky-500/25',
        Icon: Info,
      }
    default:
      return {
        iconWrap:
          'bg-indigo-500/10 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400',
        confirmBtn:
          'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500 shadow-indigo-500/25',
        Icon: Info,
      }
  }
})

function closeDialog() {
  if (props.loading) return
  emit('update:open', false)
  emit('cancel')
}

function confirmDialog() {
  if (props.loading) return
  emit('confirm')
}

function onBackdropClick() {
  if (props.closeOnBackdrop) closeDialog()
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') {
    e.stopPropagation()
    closeDialog()
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      lastFocused.value = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      panelRef.value?.focus()
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeydown)
      lastFocused.value?.focus?.()
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog" appear>
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'app-dialog-title' : undefined"
        :aria-describedby="description ? 'app-dialog-description' : undefined"
      >
        <div
          class="dialog-backdrop absolute inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm"
          @click="onBackdropClick"
          aria-hidden="true"
        ></div>

        <div
          ref="panelRef"
          tabindex="-1"
          :class="[
            'dialog-panel relative w-full flex flex-col max-h-[calc(100dvh-2rem)]',
            maxWidth,
            'bg-white dark:bg-[#111118]/95 dark:backdrop-blur-2xl',
            'border border-slate-200/80 dark:border-white/[0.08]',
            'rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50',
            'focus:outline-none',
          ]"
        >
          <button
            v-if="!hideClose"
            type="button"
            @click="closeDialog"
            :disabled="loading"
            aria-label="Close dialog"
            class="absolute top-3 end-3 sm:top-4 sm:end-4 p-1.5 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none z-10"
          >
            <X class="h-4 w-4" />
          </button>

          <div class="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
            <slot name="header">
              <div class="flex items-start gap-3 sm:gap-4 pe-10">
                <div
                  v-if="!hideIcon"
                  :class="[
                    'w-10 h-10 sm:w-11 sm:h-11 rounded-xl ring-1 flex items-center justify-center shrink-0',
                    variantStyles.iconWrap,
                  ]"
                >
                  <slot name="icon">
                    <component :is="variantStyles.Icon" class="h-5 w-5" />
                  </slot>
                </div>
                <div class="min-w-0 pt-0.5 flex-1">
                  <h2
                    v-if="title"
                    id="app-dialog-title"
                    class="text-base sm:text-lg font-bold font-heading tracking-tight text-slate-900 dark:text-white"
                  >
                    {{ title }}
                  </h2>
                  <p
                    v-if="description"
                    id="app-dialog-description"
                    class="text-sm text-slate-500 dark:text-white/50 mt-1 leading-relaxed"
                  >
                    {{ description }}
                  </p>
                </div>
              </div>
            </slot>

            <div
              v-if="$slots.default"
              class="mt-4 text-sm text-slate-600 dark:text-white/60 leading-relaxed"
            >
              <slot />
            </div>
          </div>

          <div
            v-if="!hideFooter"
            class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-5 py-4 sm:px-6 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05] rounded-b-2xl shrink-0"
          >
            <slot
              name="footer"
              :close="closeDialog"
              :confirm="confirmDialog"
              :loading="loading"
            >
              <button
                type="button"
                @click="closeDialog"
                :disabled="loading"
                class="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold rounded-lg text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-white/30 disabled:opacity-50"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                @click="confirmDialog"
                :disabled="loading"
                :class="[
                  'inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 sm:py-2 sm:min-w-[96px] text-sm font-semibold text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111118] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100',
                  variantStyles.confirmBtn,
                ]"
              >
                <svg
                  v-if="loading"
                  class="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                    class="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    class="opacity-75"
                  />
                </svg>
                <span>{{ confirmText }}</span>
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 200ms cubic-bezier(0.22, 1, 0.36, 1);
}
.dialog-enter-active .dialog-panel,
.dialog-leave-active .dialog-panel {
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 200ms cubic-bezier(0.22, 1, 0.36, 1);
}
.dialog-enter-active .dialog-backdrop,
.dialog-leave-active .dialog-backdrop {
  transition: opacity 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from .dialog-panel,
.dialog-leave-to .dialog-panel {
  opacity: 0;
  transform: translateY(6px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active,
  .dialog-leave-active,
  .dialog-enter-active .dialog-panel,
  .dialog-leave-active .dialog-panel,
  .dialog-enter-active .dialog-backdrop,
  .dialog-leave-active .dialog-backdrop {
    transition-duration: 0ms;
  }
  .dialog-enter-from .dialog-panel,
  .dialog-leave-to .dialog-panel {
    transform: none;
  }
}
</style>
