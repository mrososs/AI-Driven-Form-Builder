<script setup lang="ts">
import { computed } from 'vue'

type Size = 'md' | 'lg' | 'xl'
const props = defineProps<{ size?: Size }>()

const sizeClass = computed(() => {
  switch (props.size ?? 'xl') {
    case 'xl': return 'text-4xl'
    case 'lg': return 'text-3xl'
    case 'md': return 'text-2xl'
  }
})
</script>

<template>
  <span class="font-heading font-extrabold tracking-tight text-white" :class="sizeClass">
    Form<span class="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">AI</span>
  </span>
</template>
