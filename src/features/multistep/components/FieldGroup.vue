<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div>
    <label
      class="block text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em] mb-2"
    >
      {{ label }}
    </label>
    <slot />
  </div>
</template>
