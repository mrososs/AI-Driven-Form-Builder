<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import StartScreen from './components/start-screen/StartScreen.vue'

const booting = ref(true)
</script>

<template>
  <div class="min-h-screen font-sans">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <Transition name="splash">
      <StartScreen v-if="booting" @done="booting = false" />
    </Transition>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.splash-leave-active {
  transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.splash-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
