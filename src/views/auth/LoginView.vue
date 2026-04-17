<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-vue-next'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { useAuthStore } from '../../stores/auth'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref<{ email?: string; password?: string }>({})

const isRTL = computed(() => locale.value === 'ar')

function validate() {
  errors.value = {}
  if (!email.value.trim()) errors.value.email = t('auth.validation.emailRequired')
  if (!password.value) errors.value.password = t('auth.validation.passwordRequired')
  return !errors.value.email && !errors.value.password
}

async function handleSubmit() {
  authStore.clearError()
  if (!validate()) return

  await authStore.login(email.value.trim(), password.value)

  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect as string | undefined
    router.push(redirect && redirect.startsWith('/') ? redirect : '/builder')
  }
}
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md">
      <div class="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/40">

        <!-- Header -->
        <div class="mb-8">
          <h1 class="font-heading text-3xl font-bold text-white mb-2">
            {{ t('auth.login.title') }}
          </h1>
          <p class="text-slate-400 text-sm">{{ t('auth.login.subtitle') }}</p>
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
              {{ t('auth.login.emailLabel') }}
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
                :placeholder="t('auth.login.emailPlaceholder')"
                autocomplete="email"
                :class="[
                  'w-full bg-white/[0.05] border rounded-xl text-white text-sm',
                  'placeholder-slate-500 outline-none transition-all duration-200 py-3',
                  'focus:ring-2 focus:border-transparent',
                  isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4',
                  errors.email
                    ? 'border-rose-500/50 focus:ring-rose-500/50'
                    : 'border-white/[0.09] focus:ring-indigo-500/60',
                ]"
              />
            </div>
            <p v-if="errors.email" class="text-rose-400 text-xs mt-1.5">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-slate-300">
                {{ t('auth.login.passwordLabel') }}
              </label>
              <RouterLink to="/forgot-password"
                class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                {{ t('auth.login.forgotPassword') }}
              </RouterLink>
            </div>
            <div class="relative">
              <Lock
                class="absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                :class="isRTL ? 'right-3' : 'left-3'"
                :size="17"
              />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('auth.login.passwordPlaceholder')"
                autocomplete="current-password"
                :class="[
                  'w-full bg-white/[0.05] border rounded-xl text-white text-sm',
                  'placeholder-slate-500 outline-none transition-all duration-200 py-3',
                  'focus:ring-2 focus:border-transparent',
                  isRTL ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10',
                  errors.password
                    ? 'border-rose-500/50 focus:ring-rose-500/50'
                    : 'border-white/[0.09] focus:ring-indigo-500/60',
                ]"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                :class="isRTL ? 'left-2' : 'right-2'"
              >
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
            <p v-if="errors.password" class="text-rose-400 text-xs mt-1.5">{{ errors.password }}</p>
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
                   flex items-center justify-center gap-2 mt-2"
          >
            <template v-if="!authStore.loading">
              {{ t('auth.login.submit') }}
              <ArrowRight :size="16" />
            </template>
            <template v-else>
              <svg class="animate-spin h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ t('auth.login.loading') }}
            </template>
          </button>

        </form>

        <!-- Sign up link -->
        <p class="mt-6 text-center text-slate-500 text-sm">
          {{ t('auth.login.noAccount') }}
          <RouterLink to="/register"
            class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors ms-1">
            {{ t('auth.login.signUp') }}
          </RouterLink>
        </p>

      </div>
    </div>
  </AuthLayout>
</template>
