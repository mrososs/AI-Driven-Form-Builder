<script setup lang="ts">
import logoUrl from '../../../assets/logos/AI-Form-Builder-Logo.png'

defineProps<{ size?: number }>()
</script>

<template>
  <img
    :src="logoUrl"
    alt="FormAI"
    :style="{ height: `${size ?? 40}px`, width: 'auto' }"
    class="select-none drop-shadow-[0_0_20px_rgba(139,92,246,0.35)]"
  />
</template>
