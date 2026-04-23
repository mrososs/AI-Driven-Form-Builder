<script setup lang="ts">
import { shallowRef, useTemplateRef } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Sparkles, Moon, Sun, LogOut, ChevronDown } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '../../stores/auth'
import { useTheme } from '../../composables/useTheme'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const { isDark, toggleDark } = useTheme()

const isProfileOpen = shallowRef(false)
const profileMenuRef = useTemplateRef<HTMLElement>('profileMenuRef')

onClickOutside(profileMenuRef, () => {
  isProfileOpen.value = false
})

async function handleLogout() {
  isProfileOpen.value = false
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <header
    class="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07] z-40"
  >
    <!-- Left: Logo -->
    <RouterLink to="/builder" class="flex items-center gap-2 group flex-shrink-0">
      <div
        class="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30 ring-1 ring-white/20 group-hover:shadow-indigo-500/50 transition-all duration-200 group-hover:scale-105"
      >
        <Sparkles class="h-3.5 w-3.5 text-white" />
      </div>
      <span class="font-bold text-base tracking-tight font-heading text-slate-900 dark:text-white hidden sm:inline">
        FormAI
      </span>
    </RouterLink>

    <!-- Center: Nav links -->
    <nav class="flex items-center gap-1" aria-label="Builder navigation">
      <RouterLink
        to="/builder"
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150',
          route.name === 'builder'
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.07]'
        ]"
      >
        {{ t('builder.nav.builder') }}
      </RouterLink>
      <RouterLink
        to="/forms"
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150',
          route.name === 'forms'
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.07]'
        ]"
      >
        {{ t('builder.nav.forms') }}
      </RouterLink>
    </nav>

    <!-- Right: Theme toggle + profile -->
    <div class="flex items-center gap-1 flex-shrink-0">
      <!-- Theme toggle -->
      <button
        @click="toggleDark()"
        :aria-label="isDark ? t('builder.navbar.themeToggle.toLight') : t('builder.navbar.themeToggle.toDark')"
        class="p-2 rounded-lg transition-all duration-150 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/[0.07]"
      >
        <Sun v-if="isDark" class="h-4 w-4" />
        <Moon v-else class="h-4 w-4" />
      </button>

      <!-- Divider -->
      <div class="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1"></div>

      <!-- Profile dropdown -->
      <div class="relative" ref="profileMenuRef">
        <button
          @click="isProfileOpen = !isProfileOpen"
          :aria-label="t('builder.navbar.profileMenu')"
          :aria-expanded="isProfileOpen"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all duration-150"
        >
          <img
            v-if="authStore.user?.photoURL"
            :src="authStore.user.photoURL"
            :alt="authStore.userDisplayName"
            class="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10"
          />
          <div
            v-else
            class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm shadow-indigo-500/30 ring-1 ring-white/20 shrink-0"
          >
            {{ authStore.userInitial }}
          </div>
          <ChevronDown
            class="h-3.5 w-3.5 text-slate-400 dark:text-white/40 transition-transform duration-200 hidden sm:block"
            :class="{ 'rotate-180': isProfileOpen }"
          />
        </button>

        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            v-if="isProfileOpen"
            class="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-lg shadow-black/10 dark:shadow-black/40 overflow-hidden origin-top-right"
          >
            <!-- Identity -->
            <div class="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
              <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {{ authStore.userDisplayName }}
              </p>
              <p class="text-xs text-slate-500 dark:text-white/40 truncate mt-0.5">
                {{ authStore.user?.email }}
              </p>
            </div>

            <!-- Logout -->
            <div class="p-1.5">
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-slate-600 dark:text-white/70 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-150"
              >
                <LogOut class="h-4 w-4 shrink-0" />
                {{ t('builder.navbar.logout') }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
