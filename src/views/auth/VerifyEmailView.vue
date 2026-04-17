<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Mail, RefreshCw, Send, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { useAuthStore } from '../../stores/auth'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

const isRTL = computed(() => locale.value === 'ar')
const resendTimer = ref(0)
const resendSuccess = ref(false)
const checkLoading = ref(false)
let timerInterval: number | null = null

const startTimer = () => {
  resendTimer.value = 60
  timerInterval = window.setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      stopTimer()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const handleResend = async () => {
  if (resendTimer.value > 0) return
  
  await authStore.sendVerification()
  resendSuccess.value = true
  startTimer()
  
  setTimeout(() => {
    resendSuccess.value = false
  }, 5000)
}

const handleCheckStatus = async () => {
  checkLoading.value = true
  await authStore.reloadUser()
  checkLoading.value = false
  
  if (authStore.isVerified) {
    router.push('/builder')
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Auto-check periodically
let autoCheckInterval: number | null = null
onMounted(() => {
  autoCheckInterval = window.setInterval(async () => {
    await authStore.reloadUser()
    if (authStore.isVerified) {
      router.push('/builder')
    }
  }, 5000)
})

onUnmounted(() => {
  stopTimer()
  if (autoCheckInterval) clearInterval(autoCheckInterval)
})
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md">
      <div class="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/40">
        
        <!-- Icon -->
        <div class="mb-8 flex justify-center">
          <div class="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
            <Mail class="text-indigo-400" :size="40" />
          </div>
        </div>

        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="font-heading text-3xl font-bold text-white mb-3">
            {{ t('auth.verifyEmail.title') }}
          </h1>
          <p class="text-slate-400 text-sm leading-relaxed">
            {{ t('auth.verifyEmail.subtitle') }} <br />
            <span class="text-white font-medium mt-1 inline-block">{{ authStore.user?.email }}</span>
          </p>
        </div>

        <!-- Success Message -->
        <div v-if="authStore.isVerified" 
          class="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-start gap-3 mb-6">
          <CheckCircle2 class="text-emerald-400 shrink-0 mt-0.5" :size="16" />
          <span class="text-emerald-400 text-sm">{{ t('auth.verifyEmail.verifiedSuccess') }}</span>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error"
          class="bg-rose-500/10 border border-rose-500/25 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle class="text-rose-400 shrink-0 mt-0.5" :size="16" />
          <span class="text-rose-400 text-sm">{{ t(authStore.error) }}</span>
        </div>

        <!-- Instructions -->
        <div class="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 mb-8">
          <p class="text-slate-400 text-xs text-center leading-relaxed">
            {{ t('auth.verifyEmail.description') }}
          </p>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <button
            @click="handleCheckStatus"
            :disabled="checkLoading || authStore.loading"
            class="w-full bg-white text-slate-950 font-semibold text-sm
                   py-3 rounded-xl transition-all duration-200 
                   hover:bg-slate-200 active:scale-[0.98]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
          >
            <RefreshCw :class="['h-4 w-4', checkLoading ? 'animate-spin' : '']" />
            {{ t('auth.verifyEmail.checkStatus') }}
          </button>

          <button
            @click="handleResend"
            :disabled="resendTimer > 0 || authStore.loading"
            class="w-full bg-white/[0.05] hover:bg-white/[0.08] text-white font-medium text-sm
                   py-3 rounded-xl border border-white/[0.08]
                   transition-all duration-200 active:scale-[0.98]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
          >
            <Send class="h-4 w-4" />
            <template v-if="resendTimer > 0">
              {{ t('auth.verifyEmail.resendCooldown', { s: resendTimer }) }}
            </template>
            <template v-else>
              {{ t('auth.verifyEmail.resend') }}
            </template>
          </button>
        </div>

        <div v-if="resendSuccess" class="mt-4 text-center">
          <span class="text-emerald-400 text-xs flex items-center justify-center gap-1.5 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 :size="12" />
            {{ t('auth.verifyEmail.resendSuccess') }}
          </span>
        </div>

        <!-- Footer -->
        <button 
          @click="handleLogout"
          class="mt-10 w-full flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft :size="14" :class="isRTL ? 'rotate-180' : ''" />
          {{ t('auth.verifyEmail.backToLogin') }}
        </button>

      </div>
    </div>
  </AuthLayout>
</template>
