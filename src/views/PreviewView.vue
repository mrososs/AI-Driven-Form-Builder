<script setup lang="ts">
import { shallowRef, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save, Monitor, Smartphone, Wifi, Battery } from 'lucide-vue-next'
import { useFormStore } from '../stores/form'
import FormPreviewField from '../features/preview/FormPreviewField.vue'

type ViewMode = 'desktop' | 'mobile'

const router = useRouter()
const formStore = useFormStore()
const viewMode = shallowRef<ViewMode>('mobile')

const TOGGLE_BASE =
  'flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-md transition-all duration-200'
const TOGGLE_ACTIVE = `${TOGGLE_BASE} font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-500/20`
const TOGGLE_INACTIVE = `${TOGGLE_BASE} font-medium text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white/60 cursor-pointer`

function toggleClass(mode: ViewMode) {
  return viewMode.value === mode ? TOGGLE_ACTIVE : TOGGLE_INACTIVE
}

const currentTime = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
})

async function handleSave() {
  try {
    await formStore.saveFormToFirestore()
  } catch {
    alert('Failed to save form. Please try again.')
  }
}
</script>

<template>
  <div class="preview-root flex flex-col h-screen overflow-hidden">

    <!-- Header -->
    <header
      class="h-14 px-3 sm:px-5 flex items-center justify-between gap-2 shrink-0 z-10
             bg-white dark:bg-[#111118]
             border-b border-slate-200 dark:border-white/[0.06]"
    >
      <button
        @click="router.push('/builder')"
        class="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-lg transition-colors shrink-0
               text-slate-600 dark:text-white/50
               hover:text-slate-900 dark:hover:text-white
               hover:bg-slate-100 dark:hover:bg-white/[0.05]"
        aria-label="Back to Builder"
      >
        <ArrowLeft class="h-4 w-4" />
        <span class="hidden sm:inline">Back to Builder</span>
      </button>

      <!-- View Mode Toggle -->
      <div
        class="flex items-center gap-0.5 rounded-lg p-1
               bg-slate-100 dark:bg-white/[0.04]
               border border-slate-200 dark:border-white/[0.06]"
      >
        <button :class="toggleClass('desktop')" @click="viewMode = 'desktop'">
          <Monitor class="h-3.5 w-3.5" />
          Desktop
        </button>
        <button :class="toggleClass('mobile')" @click="viewMode = 'mobile'">
          <Smartphone class="h-3.5 w-3.5" />
          Mobile
        </button>
      </div>

      <button
        @click="handleSave"
        :disabled="formStore.isSaving"
        class="flex items-center gap-2 px-3 sm:px-4 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors shrink-0"
        :aria-label="formStore.isSaving ? 'Saving' : 'Save Form'"
      >
        <Save class="h-3.5 w-3.5" :class="{ 'animate-spin': formStore.isSaving }" />
        <span class="hidden sm:inline">{{ formStore.isSaving ? 'Saving…' : 'Save Form' }}</span>
      </button>
    </header>

    <!-- Preview Stage -->
    <div class="preview-stage flex-1 overflow-y-auto">
      <div class="min-h-full flex items-center justify-center py-6 px-3 sm:py-12 sm:px-6">

        <Transition name="preview-fade" mode="out-in">

          <!-- ── Desktop Preview ── -->
          <div v-if="viewMode === 'desktop'" key="desktop" class="desktop-window">
            <!-- Browser chrome -->
            <div class="browser-chrome">
              <div class="browser-dots">
                <span class="browser-dot browser-dot--red" />
                <span class="browser-dot browser-dot--yellow" />
                <span class="browser-dot browser-dot--green" />
              </div>
              <div class="browser-url">form-preview</div>
              <div class="browser-dots-spacer" aria-hidden="true" />
            </div>

            <!-- Form card -->
            <div class="desktop-form-card">
              <!-- Form header band -->
              <div class="desktop-form-header">
                <h1 class="text-xl font-bold text-white leading-snug">{{ formStore.title || 'Untitled Form' }}</h1>
                <p v-if="formStore.description" class="text-indigo-100/80 text-sm mt-1.5 leading-relaxed">
                  {{ formStore.description }}
                </p>
              </div>

              <!-- Fields -->
              <form class="desktop-form-body @container" @submit.prevent>
                <template v-for="element in formStore.elements" :key="element.id">
                  <FormPreviewField :element="element" />
                </template>

                <p
                  v-if="formStore.elements.length === 0"
                  class="text-center py-10 text-sm text-slate-400 dark:text-white/40"
                >
                  No fields added yet.
                </p>

                <div class="pt-2">
                  <button
                    type="submit"
                    class="w-full py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>

            <p class="mt-5 text-xs tracking-widest uppercase text-center text-slate-400 dark:text-white/25">
              Desktop Preview
            </p>
          </div>

          <!-- ── Mobile Mockup ── -->
          <div v-else key="mobile" class="flex flex-col items-center">
            <div class="phone-frame">

              <div class="phone-screen">

                <div class="phone-status-bar">
                  <span class="text-[11px] font-semibold text-white/90 tabular-nums">{{ currentTime }}</span>
                  <div class="flex items-center gap-1.5 text-white/70">
                    <Wifi class="h-3 w-3" aria-hidden="true" />
                    <Battery class="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                </div>

                <div class="phone-dynamic-island" aria-hidden="true" />

                <div class="phone-form-header px-5 pb-4 shrink-0">
                  <h1 class="text-sm font-bold text-white leading-snug">{{ formStore.title || 'Untitled Form' }}</h1>
                  <p v-if="formStore.description" class="text-indigo-100/80 text-xs mt-0.5 leading-relaxed">
                    {{ formStore.description }}
                  </p>
                </div>

                <form class="phone-form-body @container flex-1 overflow-y-auto px-5 py-5 space-y-5" @submit.prevent>
                  <template v-for="element in formStore.elements" :key="element.id">
                    <FormPreviewField :element="element" />
                  </template>

                  <p
                    v-if="formStore.elements.length === 0"
                    class="text-center py-10 text-xs text-slate-400 dark:text-white/40"
                  >
                    No fields added yet.
                  </p>

                  <div class="pt-1 pb-2">
                    <button
                      type="submit"
                      class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </form>

                <div class="phone-home-indicator" aria-hidden="true">
                  <div class="phone-home-bar" />
                </div>
              </div>
            </div>

            <p class="mt-5 text-xs tracking-widest uppercase text-slate-400 dark:text-white/25">
              Mobile Preview
            </p>
          </div>

        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Stage (light defaults; dark overrides live in the non-scoped block below) ── */
.preview-root {
  background: #f8fafc;
}

.preview-stage {
  background:
    radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05), transparent 55%),
    #f8fafc;
}

/* ── Desktop Window ── */
.desktop-window {
  width: 100%;
  max-width: 720px;
}

.browser-chrome {
  background: #e2e8f0;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-bottom: none;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.browser-dots {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  width: 64px;
}

.browser-dots-spacer {
  width: 64px;
  flex-shrink: 0;
}

.browser-dot {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  display: inline-block;
}

.browser-dot--red    { background: #ff5f57; }
.browser-dot--yellow { background: #febc2e; }
.browser-dot--green  { background: #28c840; }

.browser-url {
  flex: 1;
  background: rgba(15, 23, 42, 0.06);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.5);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desktop-form-card {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-top: none;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.15);
}

.desktop-form-header {
  background: #4f46e5;
  padding: clamp(20px, 5vw, 28px) clamp(18px, 6vw, 32px) clamp(18px, 4vw, 24px);
}

.desktop-form-body {
  padding: clamp(20px, 5vw, 28px) clamp(18px, 6vw, 32px) clamp(20px, 5vw, 32px);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── Phone Frame (hardware always dark) ── */
.phone-frame {
  width: 375px;
  max-width: 100%;
  flex-shrink: 0;
  background: #12121e;
  border-radius: 50px;
  padding: 10px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.09),
    0 0 0 2px rgba(0, 0, 0, 0.4),
    0 40px 100px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.phone-screen {
  height: 760px;
  background: #f8fafc;
  border-radius: 42px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Shrink the phone mockup when the viewport itself is phone-sized. */
@media (max-width: 420px) {
  .phone-frame {
    padding: 6px;
    border-radius: 36px;
  }
  .phone-screen {
    height: min(720px, calc(100dvh - 160px));
    border-radius: 30px;
  }
}

.phone-status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  padding: 14px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
  background: #4f46e5;
}

.phone-dynamic-island {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 34px;
  background: #0a0a0f;
  border-radius: 20px;
  z-index: 20;
}

.phone-form-header {
  padding-top: 52px;
  background: #4f46e5;
}

.phone-form-body {
  background: #f8fafc;
}

.phone-home-indicator {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f8fafc;
}

.phone-home-bar {
  width: 130px;
  height: 5px;
  background: rgba(0, 0, 0, 0.18);
  border-radius: 3px;
}

/* ── View Mode Transition ── */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
  .preview-fade-enter-active,
  .preview-fade-leave-active {
    transition: opacity 0.18s ease;
  }
  .preview-fade-enter-from,
  .preview-fade-leave-to {
    transform: none;
  }
}
</style>

<!-- Non-scoped so the `.dark` ancestor class on <html> can match our
     scoped elements without Vue rewriting the ancestor selector. -->
<style>
.dark .preview-root { background: #0d0d14; }
.dark .preview-stage {
  background:
    radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 55%),
    #0d0d14;
}
.dark .browser-chrome {
  background: #1e1e2e;
  border-color: rgba(255, 255, 255, 0.07);
}
.dark .browser-url {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.35);
}
.dark .desktop-form-card {
  background: #13131c;
  border-color: rgba(255, 255, 255, 0.07);
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
}
.dark .desktop-form-body { background: #13131c; }
.dark .phone-frame {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.09),
    0 0 0 2px rgba(0, 0, 0, 0.6),
    0 40px 100px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
.dark .phone-screen { background: #13131c; }
.dark .phone-form-body { background: #13131c; }
.dark .phone-home-indicator { background: #13131c; }
.dark .phone-home-bar { background: rgba(255, 255, 255, 0.2); }
</style>
