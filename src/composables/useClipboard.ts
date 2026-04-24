import { useClipboard as useVueUseClipboard } from '@vueuse/core'

export function useClipboard() {
  const { copy, copied, isSupported } = useVueUseClipboard({ copiedDuring: 1500 })
  return { copy, copied, isSupported }
}
