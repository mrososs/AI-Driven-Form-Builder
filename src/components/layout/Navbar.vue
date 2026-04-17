<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed, ref } from 'vue'
import { Moon, Sun, Languages, ArrowRight, Sparkles, Menu, X } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { useTheme } from '../../composables/useTheme'
import { useLanguage } from '../../composables/useLanguage'

const { isDark, toggleDark } = useTheme()
const { t, locale, toggleLanguage } = useLanguage()

const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 16)
const isMenuOpen = ref(false)
const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value }
</script>

<template>
  <header
    :class="[
      'sticky top-0 inset-x-0 z-50 transition-all duration-300',
      isScrolled
        ? 'bg-white/90 dark:bg-[#08080f]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.07] shadow-md dark:shadow-black/40'
        : 'bg-transparent border-b border-transparent backdrop-blur-none'
    ]"
  >
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between gap-8">

        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 flex-shrink-0 group">
          <div class="flex items-center justify-center w-8 h-8 rounded-xl
            bg-gradient-to-br from-indigo-500 to-violet-600
            shadow-lg shadow-indigo-500/30
            ring-1 ring-white/20
            group-hover:shadow-indigo-500/50 transition-all duration-200 group-hover:scale-105">
            <Sparkles class="h-4 w-4 text-white" />
          </div>
          <span class="font-bold text-lg tracking-tight text-slate-900 dark:text-white font-heading">
            FormAI
          </span>
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1 flex-1 justify-center">
          <a href="#"
            class="px-3.5 py-2 text-sm font-medium rounded-lg transition-all
              text-slate-600 hover:text-slate-900 hover:bg-slate-100
              dark:text-white/65 dark:hover:text-white dark:hover:bg-white/[0.07]">
            {{ t('nav.docs') }}
          </a>
          <a href="#"
            class="px-3.5 py-2 text-sm font-medium rounded-lg transition-all
              text-slate-600 hover:text-slate-900 hover:bg-slate-100
              dark:text-white/65 dark:hover:text-white dark:hover:bg-white/[0.07]">
            {{ t('nav.api') }}
          </a>
          <a href="#"
            class="px-3.5 py-2 text-sm font-medium rounded-lg transition-all
              text-slate-600 hover:text-slate-900 hover:bg-slate-100
              dark:text-white/65 dark:hover:text-white dark:hover:bg-white/[0.07]">
            {{ t('nav.examples') }}
          </a>
          <a href="#"
            class="px-3.5 py-2 text-sm font-medium rounded-lg transition-all
              text-slate-600 hover:text-slate-900 hover:bg-slate-100
              dark:text-white/65 dark:hover:text-white dark:hover:bg-white/[0.07]">
            {{ t('nav.blog') }}
          </a>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-1.5 flex-shrink-0">

          <!-- Language Toggle -->
          <button
            @click="toggleLanguage"
            class="p-2 rounded-lg transition-all
              text-slate-500 hover:text-slate-900 hover:bg-slate-100
              dark:text-white/50 dark:hover:text-white dark:hover:bg-white/[0.07]"
            :aria-label="locale === 'en' ? 'Switch to Arabic' : 'Switch to English'"
          >
            <Languages class="h-4 w-4" />
          </button>

          <!-- Theme Toggle -->
          <button
            @click="toggleDark()"
            class="p-2 rounded-lg transition-all
              text-slate-500 hover:text-slate-900 hover:bg-slate-100
              dark:text-white/50 dark:hover:text-white dark:hover:bg-white/[0.07]"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <Sun v-if="isDark" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
          </button>

          <!-- Divider -->
          <div class="hidden sm:block w-px h-5 bg-slate-200 dark:bg-white/10 mx-1"></div>

          <!-- CTA -->
          <RouterLink
            to="/builder"
            class="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl
              text-white
              bg-indigo-600 hover:bg-indigo-500
              dark:bg-gradient-to-r dark:from-indigo-500 dark:via-indigo-500 dark:to-violet-600
              dark:hover:from-indigo-400 dark:hover:to-violet-500
              shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/25
              transition-all duration-200 hover:shadow-indigo-500/40 hover:-translate-y-px
              [&:hover]:gap-3"
          >
            {{ t('nav.startBtn') }}
            <ArrowRight class="h-3.5 w-3.5 transition-none" />
          </RouterLink>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMenu"
            class="md:hidden p-2 rounded-lg transition-all
              text-slate-500 hover:text-slate-900 hover:bg-slate-100
              dark:text-white/50 dark:hover:text-white dark:hover:bg-white/[0.07]"
            aria-label="Toggle Menu"
          >
            <Menu class="h-5 w-5" />
          </button>
        </div>

      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div 
      v-show="isMenuOpen" 
      class="md:hidden fixed inset-0 z-50 flex"
    >
      <!-- Overlay -->
      <div 
        class="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        @click="isMenuOpen = false"
      ></div>
      
      <!-- Drawer -->
      <nav 
        class="relative flex w-[85%] max-w-sm flex-col overflow-y-auto bg-white dark:bg-[#0a0a0f] py-6 px-6 shadow-2xl h-screen border-r border-slate-200 dark:border-white/10"
      >
        <div class="flex items-center justify-between mb-8 leading-none">
          <RouterLink to="/" class="flex items-center gap-3" @click="isMenuOpen = false">
            <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg ring-1 ring-white/20">
              <Sparkles class="h-4 w-4 text-white" />
            </div>
            <span class="font-bold text-lg tracking-tight text-slate-900 dark:text-white font-heading">
              FormAI
            </span>
          </RouterLink>
          <button @click="isMenuOpen = false" class="p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white rounded-lg">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="flex flex-col gap-6">
          <a href="#" @click="isMenuOpen = false" class="text-base font-semibold text-slate-700 dark:text-white/80 hover:text-indigo-600 dark:hover:text-indigo-400">{{ t('nav.docs') }}</a>
          <a href="#" @click="isMenuOpen = false" class="text-base font-semibold text-slate-700 dark:text-white/80 hover:text-indigo-600 dark:hover:text-indigo-400">{{ t('nav.api') }}</a>
          <a href="#" @click="isMenuOpen = false" class="text-base font-semibold text-slate-700 dark:text-white/80 hover:text-indigo-600 dark:hover:text-indigo-400">{{ t('nav.examples') }}</a>
          <a href="#" @click="isMenuOpen = false" class="text-base font-semibold text-slate-700 dark:text-white/80 hover:text-indigo-600 dark:hover:text-indigo-400">{{ t('nav.blog') }}</a>
          
          <div class="h-px bg-slate-200 dark:bg-white/10 my-2 w-full"></div>
          
          <RouterLink
            to="/builder"
            @click="isMenuOpen = false"
            class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-white bg-indigo-600 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600 shadow-md shadow-indigo-500/20"
          >
            {{ t('nav.startBtn') }}
            <ArrowRight class="h-4 w-4" />
          </RouterLink>
        </div>
      </nav>
    </div>
  </header>
</template>
