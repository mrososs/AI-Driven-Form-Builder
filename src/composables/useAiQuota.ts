import { computed, onScopeDispose, shallowRef, watch } from 'vue'
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { useAuthStore } from '../stores/auth'

export const AI_DAILY_LIMIT = 2

interface AiUsageDoc {
  count?: number
  date?: string
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useAiQuota() {
  const authStore = useAuthStore()
  const usage = shallowRef<AiUsageDoc | null>(null)
  const ready = shallowRef(false)
  let unsub: Unsubscribe | null = null

  function detach() {
    if (unsub) {
      unsub()
      unsub = null
    }
  }

  watch(
    () => authStore.user?.uid,
    (uid) => {
      detach()
      ready.value = false
      usage.value = null
      if (!uid) {
        ready.value = true
        return
      }
      const ref = doc(db, 'aiUsage', uid)
      unsub = onSnapshot(
        ref,
        (snap) => {
          usage.value = snap.exists() ? (snap.data() as AiUsageDoc) : {}
          ready.value = true
        },
        () => {
          // permission errors etc — treat as no data so UI doesn't block sign-in flows
          usage.value = {}
          ready.value = true
        },
      )
    },
    { immediate: true },
  )

  onScopeDispose(detach)

  const used = computed(() => {
    const data = usage.value
    if (!data) return 0
    return data.date === todayUtc() ? data.count ?? 0 : 0
  })
  const remaining = computed(() => Math.max(0, AI_DAILY_LIMIT - used.value))
  const exhausted = computed(() => remaining.value === 0)
  const emailVerified = computed(() => auth.currentUser?.emailVerified ?? false)

  return {
    ready,
    used,
    remaining,
    exhausted,
    emailVerified,
    limit: AI_DAILY_LIMIT,
  }
}
