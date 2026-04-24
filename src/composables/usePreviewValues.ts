import { inject, provide, reactive, type InjectionKey } from 'vue'
import type { PreviewValueMap } from '../features/builder/dependencies'

export interface PreviewValuesStore {
  values: PreviewValueMap
  setValue(id: string, value: unknown): void
  getValue(id: string): unknown
  reset(): void
}

const KEY: InjectionKey<PreviewValuesStore> = Symbol('previewValues')

export function providePreviewValues(): PreviewValuesStore {
  const values = reactive<PreviewValueMap>({})
  const store: PreviewValuesStore = {
    values,
    setValue(id, value) {
      values[id] = value
    },
    getValue(id) {
      return values[id]
    },
    reset() {
      for (const k of Object.keys(values)) delete values[k]
    },
  }
  provide(KEY, store)
  return store
}

export function usePreviewValues(): PreviewValuesStore | undefined {
  return inject(KEY, undefined)
}
