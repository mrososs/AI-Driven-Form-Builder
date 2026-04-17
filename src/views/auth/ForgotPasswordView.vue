<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-vue-next'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { useAuthStore } from '../../stores/auth'

const { t, locale } = useI18n()
const authStore = useAuthStore()

const email = ref('')
const successEmail = ref('')
const showSuccess = ref(false)
const fieldError = ref('')

const isRTL = computed(() => locale.value === 'ar')

function validateEmail() {
  if (!email.value.trim()) {
    fieldError.value = t('auth.validation.emailRequired')
    return false
  }
  fieldError.value = ''
  return true
}

async function handleSubmit() {
  authStore.clearError()
  if (!validateEmail()) return

  const ok = await authStore.sendPasswordReset(email.value.trim())
  if (ok) {
    successEmail.value = email.value.trim()
    showSuccess.value = true
  }
}
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md">
      <div class="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/40">

        <!-- Success state -->
        <div v-if="showSuccess" class="text-center py-4">
          <div class="flex justify-center mb-5">
            <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle class="text-emerald-400" :size="32" />
            </div>
          </div>
          <h1 class="font-heading text-2xl font-bold text-white mb-3">
            {{ t('auth.forgotPassword.success.title') }}
          </h1>
          <p class="text-slate-400 text-sm leading-relaxed mb-8">
            {{ t('auth.forgotPassword.success.message', { email: successEmail }) }}
          </p>
          <RouterLink to="/login"
            class="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            <ArrowLeft :size="16" />
            {{ t('auth.forgotPassword.success.back') }}
          </RouterLink>
        </div>

        <!-- Form state -->
        <template v-else>
          <!-- Header -->
          <div class="mb-8">
            <h1 class="font-heading text-3xl font-bold text-white mb-2">
              {{ t('auth.forgotPassword.title') }}
            </h1>
            <p class="text-slate-400 text-sm">{{ t('auth.forgotPassword.subtitle') }}</p>
          </div>

          <!-- Server error -->
          <div v-if="authStore.error"
            class="bg-rose-500/10 border border-rose-500/25 rounded-xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle class="text-rose-400 shrink-0 mt-0.5" :size="16" />
            <span class="text-rose-400 text-sm">{{ t(authStore.error) }}</span>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-5">

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                {{ t('auth.forgotPassword.emailLabel') }}
              </label>
              <div class="relative">
                <Mail
                  class="absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  :class="isRTL ? 'right-3' : 'left-3'"
                  :size="17"
                />
                <input
                  v-model="email"
                  type="email"
                  :placeholder="t('auth.forgotPassword.emailPlaceholder')"
                  autocomplete="email"
                  :class="[
                    'w-full bg-white/[0.05] border rounded-xl text-white text-sm',
                    'placeholder-slate-500 outline-none transition-all duration-200 py-3',
                    'focus:ring-2 focus:border-transparent',
                    isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4',
                    fieldError
                      ? 'border-rose-500/50 focus:ring-rose-500/50'
                      : 'border-white/[0.09] focus:ring-indigo-500/60',
                  ]"
                />
              </div>
              <p v-if="fieldError" class="text-rose-400 text-xs mt-1.5">{{ fieldError }}</p>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full bg-gradient-to-r from-indigo-600 to-violet-600
                     hover:from-indigo-500 hover:to-violet-500
                     shadow-lg shadow-indigo-500/25
                     text-white font-semibold text-sm
                     py-3 rounded-xl
                     transition-all duration-200 hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                     flex items-center justify-center gap-2"
            >
              <span v-if="!authStore.loading">{{ t('auth.forgotPassword.submit') }}</span>
              <span v-else class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ t('auth.forgotPassword.loading') }}
              </span>
            </button>

          </form>

          <!-- Back to login -->
          <div class="mt-6 text-center">
            <RouterLink to="/login"
              class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors">
              <ArrowLeft :size="15" />
              {{ t('auth.forgotPassword.back') }}
            </RouterLink>
          </div>
        </template>

      </div>
    </div>
  </AuthLayout>
</template>
