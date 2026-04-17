<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, RouterLink } from 'vue-router'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-vue-next'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { useAuthStore } from '../../stores/auth'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const errors = ref<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({})

const isRTL = computed(() => locale.value === 'ar')

const passwordStrength = computed(() => {
  const p = password.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthColor = computed(() => {
  if (passwordStrength.value <= 1) return 'bg-rose-500'
  if (passwordStrength.value === 2) return 'bg-amber-500'
  return 'bg-emerald-500'
})

function validate() {
  errors.value = {}
  if (!name.value.trim()) errors.value.name = t('auth.validation.nameRequired')
  if (!email.value.trim()) errors.value.email = t('auth.validation.emailRequired')
  if (!password.value) errors.value.password = t('auth.validation.passwordRequired')
  else if (password.value.length < 8) errors.value.password = t('auth.validation.passwordMinLength')
  if (!confirmPassword.value) errors.value.confirmPassword = t('auth.validation.confirmPasswordRequired')
  else if (password.value !== confirmPassword.value) errors.value.confirmPassword = t('auth.errors.passwordMismatch')
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  authStore.clearError()
  if (!validate()) return

  await authStore.register(email.value.trim(), password.value, name.value.trim())

  if (authStore.isAuthenticated) {
    router.push('/verify-email')
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
            {{ t('auth.register.title') }}
          </h1>
          <p class="text-slate-400 text-sm">{{ t('auth.register.subtitle') }}</p>
        </div>

        <!-- Server error -->
        <div v-if="authStore.error"
          class="bg-rose-500/10 border border-rose-500/25 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle class="text-rose-400 shrink-0 mt-0.5" :size="16" />
          <span class="text-rose-400 text-sm">{{ t(authStore.error) }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-5">

          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ t('auth.register.nameLabel') }}
            </label>
            <div class="relative">
              <User
                class="absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                :class="isRTL ? 'right-3' : 'left-3'"
                :size="17"
              />
              <input
                v-model="name"
                type="text"
                :placeholder="t('auth.register.namePlaceholder')"
                autocomplete="name"
                :class="[
                  'w-full bg-white/[0.05] border rounded-xl text-white text-sm',
                  'placeholder-slate-500 outline-none transition-all duration-200 py-3',
                  'focus:ring-2 focus:border-transparent',
                  isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4',
                  errors.name
                    ? 'border-rose-500/50 focus:ring-rose-500/50'
                    : 'border-white/[0.09] focus:ring-indigo-500/60',
                ]"
              />
            </div>
            <p v-if="errors.name" class="text-rose-400 text-xs mt-1.5">{{ errors.name }}</p>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ t('auth.register.emailLabel') }}
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
                :placeholder="t('auth.register.emailPlaceholder')"
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
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ t('auth.register.passwordLabel') }}
            </label>
            <div class="relative">
              <Lock
                class="absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                :class="isRTL ? 'right-3' : 'left-3'"
                :size="17"
              />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('auth.register.passwordPlaceholder')"
                autocomplete="new-password"
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
            <!-- Password strength bar -->
            <div v-if="password" class="mt-2 flex gap-1">
              <div
                v-for="i in 4"
                :key="i"
                class="h-1 flex-1 rounded-full transition-all duration-300"
                :class="i <= passwordStrength ? strengthColor : 'bg-white/10'"
              />
            </div>
            <p v-if="errors.password" class="text-rose-400 text-xs mt-1.5">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              {{ t('auth.register.confirmPasswordLabel') }}
            </label>
            <div class="relative">
              <Lock
                class="absolute top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                :class="isRTL ? 'right-3' : 'left-3'"
                :size="17"
              />
              <input
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                :placeholder="t('auth.register.confirmPasswordPlaceholder')"
                autocomplete="new-password"
                :class="[
                  'w-full bg-white/[0.05] border rounded-xl text-white text-sm',
                  'placeholder-slate-500 outline-none transition-all duration-200 py-3',
                  'focus:ring-2 focus:border-transparent',
                  isRTL ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10',
                  errors.confirmPassword
                    ? 'border-rose-500/50 focus:ring-rose-500/50'
                    : 'border-white/[0.09] focus:ring-indigo-500/60',
                ]"
              />
              <button
                type="button"
                @click="showConfirm = !showConfirm"
                class="absolute top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                :class="isRTL ? 'left-2' : 'right-2'"
              >
                <EyeOff v-if="showConfirm" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="text-rose-400 text-xs mt-1.5">{{ errors.confirmPassword }}</p>
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
              {{ t('auth.register.submit') }}
              <ArrowRight :size="16" />
            </template>
            <template v-else>
              <svg class="animate-spin h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ t('auth.register.loading') }}
            </template>
          </button>

        </form>

        <!-- Sign in link -->
        <p class="mt-6 text-center text-slate-500 text-sm">
          {{ t('auth.register.hasAccount') }}
          <RouterLink to="/login"
            class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors ms-1">
            {{ t('auth.register.signIn') }}
          </RouterLink>
        </p>

      </div>
    </div>
  </AuthLayout>
</template>
