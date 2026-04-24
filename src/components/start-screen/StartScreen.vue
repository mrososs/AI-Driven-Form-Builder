<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, type Component } from 'vue'
import { useAuthStore } from '../../stores/auth'
import SplashMinimal from './SplashMinimal.vue'
import SplashOrbital from './SplashOrbital.vue'
import SplashSchemaBoot from './SplashSchemaBoot.vue'
import SplashFormMaterialize from './SplashFormMaterialize.vue'

type Variant = 'minimal' | 'orbital' | 'schemaBoot' | 'formMaterialize'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    duration?: number
  }>(),
  {
    variant: 'orbital',
    duration: 3.2,
  },
)

const emit = defineEmits<{ done: [] }>()

const VARIANTS: Record<Variant, Component> = {
  minimal: SplashMinimal,
  orbital: SplashOrbital,
  schemaBoot: SplashSchemaBoot,
  formMaterialize: SplashFormMaterialize,
}

const STAGES: { at: number; label: string }[] = [
  { at: 0,  label: 'Booting runtime' },
  { at: 18, label: 'Loading schema engine' },
  { at: 38, label: 'Connecting AI services' },
  { at: 58, label: 'Hydrating components' },
  { at: 78, label: 'Preparing your workspace' },
  { at: 98, label: 'Almost there' },
]

function stageFor(p: number): string {
  let label = STAGES[0].label
  for (const s of STAGES) if (p >= s.at) label = s.label
  return label
}

const progress = ref(0)
const status = ref(STAGES[0].label)
const variantComp = shallowRef<Component>(VARIANTS[props.variant])

let rafId = 0
let authReadyResolved = false

onMounted(() => {
  const auth = useAuthStore()
  auth.authReady.then(() => { authReadyResolved = true })

  const start = performance.now()
  const durationMs = Math.max(800, props.duration * 1000)

  const tick = () => {
    const elapsed = performance.now() - start
    const tt = Math.min(1, elapsed / durationMs)
    const eased = 1 - Math.pow(1 - tt, 3)
    progress.value = eased * 100
    status.value = stageFor(progress.value)

    if (tt >= 1 && authReadyResolved) {
      emit('done')
      return
    }
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <div class="fixed inset-0 z-[100] bg-[#08080f] dark">
    <component :is="variantComp" :progress="progress" :status="status" />
  </div>
</template>
