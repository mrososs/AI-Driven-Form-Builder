<script setup lang="ts">
import { computed } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useFormStore, type DependencyOperator, type VisibilityRule, type OptionsMap } from '../../stores/form'
import { Settings2, X, Trash2, ChevronDown } from 'lucide-vue-next'
import { getElementDefinition } from './elements'
import { useBuilderUI } from '../../composables/useBuilderUI'

const { t } = useI18n()
const formStore = useFormStore()
const { isPropertiesOpen, isMobile, closeSheets } = useBuilderUI()

const selectedElement = computed(() => formStore.selectedElement)

const definition = computed(() =>
  selectedElement.value ? getElementDefinition(selectedElement.value.type) : undefined
)

const showRequired = computed(() => selectedElement.value?.type !== 'row')
const showPlaceholder = computed(() => definition.value?.hasPlaceholder === true)
const showOptions = computed(() => definition.value?.hasOptions === true)

// Desktop: visible whenever something is selected. Mobile: gated by the sheet toggle.
const isVisible = computed(() =>
  isMobile.value ? isPropertiesOpen.value : !!selectedElement.value
)

function closeProperties() {
  formStore.selectElement(null)
  if (isMobile.value) closeSheets()
}

useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && selectedElement.value) closeProperties()
})

const label = computed({
  get: () => selectedElement.value?.label ?? '',
  set: (v) => {
    if (selectedElement.value) formStore.updateElement(selectedElement.value.id, { label: v })
  },
})

const required = computed({
  get: () => selectedElement.value?.required ?? false,
  set: (v) => {
    if (selectedElement.value) formStore.updateElement(selectedElement.value.id, { required: v })
  },
})

const placeholder = computed({
  get: () => selectedElement.value?.placeholder ?? '',
  set: (v) => {
    if (selectedElement.value) formStore.updateElement(selectedElement.value.id, { placeholder: v })
  },
})

function addOption() {
  if (selectedElement.value) formStore.addOption(selectedElement.value.id)
}

function removeOption(index: number) {
  if (selectedElement.value) formStore.removeOption(selectedElement.value.id, index)
}

function updateOptionAt(index: number, value: string) {
  if (selectedElement.value) formStore.updateOption(selectedElement.value.id, index, value)
}

// ─── Visibility ───────────────────────────────────────────────
const eligibleSources = computed(() =>
  selectedElement.value
    ? formStore.listEligibleSources(selectedElement.value.id, { forOptionsMap: false })
    : []
)

const visibilityEnabled = computed({
  get: () => !!selectedElement.value?.visibility,
  set: (on: boolean) => {
    if (!selectedElement.value) return
    if (on) {
      const firstSource = eligibleSources.value[0]
      if (!firstSource) return
      formStore.setVisibility(selectedElement.value.id, {
        sourceId: firstSource.id,
        operator: 'equals',
        value: '',
      })
    } else {
      formStore.setVisibility(selectedElement.value.id, undefined)
    }
  },
})

function patchVisibility(patch: Partial<VisibilityRule>) {
  const el = selectedElement.value
  if (!el?.visibility) return
  const next: VisibilityRule = { ...el.visibility, ...patch }
  // Reset value when switching operators that semantically change the value type.
  if (patch.operator) {
    if (patch.operator === 'empty' || patch.operator === 'notEmpty') next.value = undefined
    else if (patch.operator === 'in') next.value = Array.isArray(el.visibility.value) ? el.visibility.value : []
    else next.value = typeof el.visibility.value === 'string' ? el.visibility.value : ''
  }
  formStore.setVisibility(el.id, next)
}

const visibilitySourceId = computed({
  get: () => selectedElement.value?.visibility?.sourceId ?? '',
  set: (v: string) => patchVisibility({ sourceId: v, value: '' }),
})

const visibilityOperator = computed({
  get: () => selectedElement.value?.visibility?.operator ?? 'equals',
  set: (v: DependencyOperator) => patchVisibility({ operator: v }),
})

const visibilityValue = computed({
  get: () => {
    const raw = selectedElement.value?.visibility?.value
    if (Array.isArray(raw)) return raw.join(', ')
    return typeof raw === 'string' ? raw : ''
  },
  set: (v: string) => {
    const op = selectedElement.value?.visibility?.operator
    if (op === 'in') {
      const parts = v.split(',').map(s => s.trim()).filter(Boolean)
      patchVisibility({ value: parts })
    } else {
      patchVisibility({ value: v })
    }
  },
})

const visibilitySourceElement = computed(() => {
  const id = selectedElement.value?.visibility?.sourceId
  return id ? formStore.findElement(id) : undefined
})

const visibilitySourceHasOptions = computed(() => {
  const src = visibilitySourceElement.value
  return !!src && (src.type === 'select' || src.type === 'radio')
})

const visibilityNeedsValue = computed(() => {
  const op = selectedElement.value?.visibility?.operator
  return op !== 'empty' && op !== 'notEmpty'
})

// ─── Dependent options (select/radio only) ────────────────────
const eligibleParents = computed(() =>
  selectedElement.value
    ? formStore.listEligibleSources(selectedElement.value.id, { forOptionsMap: true })
    : []
)

const optionsSourceEnabled = computed({
  get: () => !!selectedElement.value?.optionsSource,
  set: (on: boolean) => {
    if (!selectedElement.value) return
    if (on) {
      const firstParent = eligibleParents.value[0]
      if (!firstParent) return
      formStore.setOptionsSource(selectedElement.value.id, {
        sourceId: firstParent.id,
        map: {},
      })
    } else {
      formStore.setOptionsSource(selectedElement.value.id, undefined)
    }
  },
})

const optionsSourceParentId = computed({
  get: () => selectedElement.value?.optionsSource?.sourceId ?? '',
  set: (v: string) => {
    const el = selectedElement.value
    if (!el?.optionsSource) return
    const next: OptionsMap = { ...el.optionsSource, sourceId: v, map: {} }
    formStore.setOptionsSource(el.id, next)
  },
})

const parentElement = computed(() => {
  const id = selectedElement.value?.optionsSource?.sourceId
  return id ? formStore.findElement(id) : undefined
})

function childOptionsFor(parentValue: string): string[] {
  const map = selectedElement.value?.optionsSource?.map ?? {}
  return map[parentValue] ?? []
}

function setChildOption(parentValue: string, index: number, value: string) {
  if (!selectedElement.value) return
  const current = [...childOptionsFor(parentValue)]
  current[index] = value
  formStore.updateOptionsMapEntry(selectedElement.value.id, parentValue, current)
}

function addChildOption(parentValue: string) {
  if (!selectedElement.value) return
  const current = childOptionsFor(parentValue)
  formStore.updateOptionsMapEntry(selectedElement.value.id, parentValue, [
    ...current,
    `Option ${current.length + 1}`,
  ])
}

function removeChildOption(parentValue: string, index: number) {
  if (!selectedElement.value) return
  const current = [...childOptionsFor(parentValue)]
  current.splice(index, 1)
  formStore.updateOptionsMapEntry(selectedElement.value.id, parentValue, current)
}

const fallbackOptions = computed(() => selectedElement.value?.optionsSource?.fallback ?? [])

function setFallback(index: number, value: string) {
  if (!selectedElement.value) return
  const next = [...fallbackOptions.value]
  next[index] = value
  formStore.setOptionsFallback(selectedElement.value.id, next)
}

function addFallback() {
  if (!selectedElement.value) return
  const next = [...fallbackOptions.value, `Option ${fallbackOptions.value.length + 1}`]
  formStore.setOptionsFallback(selectedElement.value.id, next)
}

function removeFallback(index: number) {
  if (!selectedElement.value) return
  const next = [...fallbackOptions.value]
  next.splice(index, 1)
  formStore.setOptionsFallback(selectedElement.value.id, next.length > 0 ? next : undefined)
}
</script>

<template>
  <!-- Mobile backdrop -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isPropertiesOpen"
      @click="closeSheets"
      class="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-30 md:hidden"
      aria-hidden="true"
    />
  </Transition>

  <aside
    v-show="isVisible"
    :class="[
      'bg-white dark:bg-[#111118] flex flex-col',
      'fixed inset-x-0 bottom-0 z-40 max-h-[85vh] rounded-t-2xl border-t border-slate-200 dark:border-white/[0.07] shadow-2xl shadow-black/20 dark:shadow-black/60 p-5',
      'md:static md:w-80 md:max-h-none md:rounded-none md:border-t-0 md:border-l md:border-slate-200 md:dark:border-white/[0.07] md:shadow-xl md:dark:shadow-black/50 md:p-6 lg:shadow-none',
    ]"
    :aria-label="t('builder.properties.header')"
  >
    <div class="flex items-center justify-between mb-6 md:mb-8">
      <div class="flex items-center gap-2">
        <Settings2 class="h-5 w-5 text-primary-600 dark:text-indigo-400" aria-hidden="true" />
        <h2 class="font-bold text-slate-800 dark:text-white text-base">{{ t('builder.properties.header') }}</h2>
      </div>
      <button
        @click="closeProperties"
        class="p-1.5 text-slate-500 dark:text-white/40 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07] rounded-lg"
        :aria-label="t('builder.properties.header')"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <div v-if="selectedElement" class="flex-1 overflow-y-auto space-y-6 pb-safe">
      <div>
        <label class="block text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-2">{{ t('builder.properties.labelField') }}</label>
        <input
          v-model="label"
          class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white bg-transparent dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
          :placeholder="t('builder.properties.labelPlaceholder')"
        />
      </div>

      <div v-if="showRequired">
        <label class="flex items-center gap-3 p-3 border border-slate-200 dark:border-white/[0.07] rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
          <input
            type="checkbox"
            v-model="required"
            class="h-4 w-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500 cursor-pointer"
          />
          <span class="text-sm font-medium text-slate-700 dark:text-white/70">{{ t('builder.properties.requiredField') }}</span>
        </label>
      </div>

      <div v-if="showPlaceholder">
        <label class="block text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-2">{{ t('builder.properties.placeholderField') }}</label>
        <input
          v-model="placeholder"
          class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white bg-transparent dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
          :placeholder="t('builder.properties.placeholderHint')"
        />
      </div>

      <div v-if="showOptions && selectedElement.options && !optionsSourceEnabled">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">{{ t('builder.properties.optionsField') }}</label>
        </div>
        <div class="space-y-2 mb-3">
          <div v-for="(option, idx) in selectedElement.options" :key="idx" class="flex items-center gap-2">
            <input
              :value="option"
              @input="updateOptionAt(idx, ($event.target as HTMLInputElement).value)"
              class="flex-1 flex-shrink min-w-0 border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-white bg-transparent dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
            />
            <button @click="removeOption(idx)" class="p-1.5 text-slate-500 dark:text-white/40 hover:text-red-500 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-lg shrink-0">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
        <button @click="addOption" class="w-full py-2 text-sm font-medium text-primary-600 dark:text-indigo-400 bg-primary-50 dark:bg-indigo-500/10 hover:bg-primary-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors">
          {{ t('builder.properties.addOption') }}
        </button>
      </div>

      <!-- ── Visibility ──────────────────────────────────────── -->
      <details class="group border border-slate-200 dark:border-white/[0.07] rounded-lg" :open="!!selectedElement.visibility">
        <summary class="flex items-center justify-between cursor-pointer list-none px-3 py-2.5 rounded-lg">
          <span class="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">{{ t('builder.properties.visibility.title') }}</span>
          <ChevronDown class="h-4 w-4 text-slate-400 dark:text-white/40 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div class="px-3 pb-3 pt-1 space-y-3">
          <label class="flex items-center gap-3 p-3 border border-slate-200 dark:border-white/[0.07] rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
            <input
              type="checkbox"
              :checked="visibilityEnabled"
              :disabled="eligibleSources.length === 0 && !visibilityEnabled"
              @change="visibilityEnabled = ($event.target as HTMLInputElement).checked"
              class="h-4 w-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span class="text-sm font-medium text-slate-700 dark:text-white/70">{{ t('builder.properties.visibility.toggle') }}</span>
          </label>

          <p
            v-if="eligibleSources.length === 0 && !visibilityEnabled"
            class="text-xs text-slate-500 dark:text-white/40 leading-relaxed"
          >
            {{ t('builder.properties.visibility.noEligibleSources') }}
          </p>

          <div v-if="visibilityEnabled" class="space-y-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-1.5">{{ t('builder.properties.visibility.sourceLabel') }}</label>
              <select
                v-model="visibilitySourceId"
                class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white bg-white dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
              >
                <option v-for="src in eligibleSources" :key="src.id" :value="src.id">{{ src.label }}</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-1.5">{{ t('builder.properties.visibility.operatorLabel') }}</label>
              <select
                v-model="visibilityOperator"
                class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white bg-white dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
              >
                <option value="equals">{{ t('builder.properties.visibility.operatorEquals') }}</option>
                <option value="notEquals">{{ t('builder.properties.visibility.operatorNotEquals') }}</option>
                <option value="in">{{ t('builder.properties.visibility.operatorIn') }}</option>
                <option value="empty">{{ t('builder.properties.visibility.operatorEmpty') }}</option>
                <option value="notEmpty">{{ t('builder.properties.visibility.operatorNotEmpty') }}</option>
              </select>
            </div>

            <div v-if="visibilityNeedsValue">
              <label class="block text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-1.5">{{ t('builder.properties.visibility.valueLabel') }}</label>
              <!-- Pick from the source's options when available (select/radio) and single-value operator -->
              <select
                v-if="visibilitySourceHasOptions && visibilityOperator !== 'in'"
                v-model="visibilityValue"
                class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white bg-white dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
              >
                <option value="">{{ t('builder.properties.visibility.valuePickOption') }}</option>
                <option v-for="opt in (visibilitySourceElement?.options ?? [])" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <input
                v-else
                v-model="visibilityValue"
                :placeholder="visibilityOperator === 'in' ? t('builder.properties.visibility.valueInPlaceholder') : t('builder.properties.visibility.valuePlaceholder')"
                class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white bg-transparent dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </details>

      <!-- ── Dependent options (select/radio only) ───────────── -->
      <details
        v-if="showOptions"
        class="group border border-slate-200 dark:border-white/[0.07] rounded-lg"
        :open="!!selectedElement.optionsSource"
      >
        <summary class="flex items-center justify-between cursor-pointer list-none px-3 py-2.5 rounded-lg">
          <span class="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">{{ t('builder.properties.dependentOptions.title') }}</span>
          <ChevronDown class="h-4 w-4 text-slate-400 dark:text-white/40 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div class="px-3 pb-3 pt-1 space-y-3">
          <label class="flex items-center gap-3 p-3 border border-slate-200 dark:border-white/[0.07] rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
            <input
              type="checkbox"
              :checked="optionsSourceEnabled"
              :disabled="eligibleParents.length === 0 && !optionsSourceEnabled"
              @change="optionsSourceEnabled = ($event.target as HTMLInputElement).checked"
              class="h-4 w-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span class="text-sm font-medium text-slate-700 dark:text-white/70">{{ t('builder.properties.dependentOptions.toggle') }}</span>
          </label>

          <p
            v-if="eligibleParents.length === 0 && !optionsSourceEnabled"
            class="text-xs text-slate-500 dark:text-white/40 leading-relaxed"
          >
            {{ t('builder.properties.dependentOptions.noEligibleParents') }}
          </p>

          <div v-if="optionsSourceEnabled" class="space-y-4">
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-1.5">{{ t('builder.properties.dependentOptions.parentLabel') }}</label>
              <select
                v-model="optionsSourceParentId"
                class="w-full border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white bg-white dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
              >
                <option v-for="p in eligibleParents" :key="p.id" :value="p.id">{{ p.label }}</option>
              </select>
            </div>

            <div v-if="parentElement" class="space-y-3">
              <p class="text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">{{ t('builder.properties.dependentOptions.mapHeading') }}</p>
              <div
                v-for="parentValue in (parentElement.options ?? [])"
                :key="parentValue"
                class="rounded-lg border border-slate-200 dark:border-white/[0.07] p-3 space-y-2"
              >
                <p class="text-xs font-medium text-slate-600 dark:text-white/60">
                  {{ t('builder.properties.dependentOptions.optionsFor', { value: parentValue }) }}
                </p>
                <div class="space-y-1.5">
                  <div
                    v-for="(opt, idx) in childOptionsFor(parentValue)"
                    :key="idx"
                    class="flex items-center gap-2"
                  >
                    <input
                      :value="opt"
                      @input="setChildOption(parentValue, idx, ($event.target as HTMLInputElement).value)"
                      class="flex-1 flex-shrink min-w-0 border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-white bg-transparent dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
                    />
                    <button
                      @click="removeChildOption(parentValue, idx)"
                      class="p-1.5 text-slate-500 dark:text-white/40 hover:text-red-500 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-lg shrink-0"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  @click="addChildOption(parentValue)"
                  class="w-full py-1.5 text-xs font-medium text-primary-600 dark:text-indigo-400 bg-primary-50 dark:bg-indigo-500/10 hover:bg-primary-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
                >
                  {{ t('builder.properties.dependentOptions.addOption') }}
                </button>
              </div>

              <div class="rounded-lg border border-slate-200 dark:border-white/[0.07] p-3 space-y-2">
                <p class="text-xs font-medium text-slate-600 dark:text-white/60">
                  {{ t('builder.properties.dependentOptions.fallbackLabel') }}
                </p>
                <p class="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed">
                  {{ t('builder.properties.dependentOptions.fallbackHint') }}
                </p>
                <div class="space-y-1.5">
                  <div
                    v-for="(opt, idx) in fallbackOptions"
                    :key="idx"
                    class="flex items-center gap-2"
                  >
                    <input
                      :value="opt"
                      @input="setFallback(idx, ($event.target as HTMLInputElement).value)"
                      class="flex-1 flex-shrink min-w-0 border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-white bg-transparent dark:bg-white/[0.03] focus:outline-none focus:border-primary-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-primary-500 dark:focus:ring-indigo-500"
                    />
                    <button
                      @click="removeFallback(idx)"
                      class="p-1.5 text-slate-500 dark:text-white/40 hover:text-red-500 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-lg shrink-0"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  @click="addFallback"
                  class="w-full py-1.5 text-xs font-medium text-primary-600 dark:text-indigo-400 bg-primary-50 dark:bg-indigo-500/10 hover:bg-primary-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
                >
                  {{ t('builder.properties.dependentOptions.addOption') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
    <div v-else class="flex-1 flex items-center justify-center">
      <p class="text-xs text-slate-400 dark:text-white/25 text-center leading-relaxed font-medium">{{ t('builder.properties.empty') }}</p>
    </div>
  </aside>
</template>

<style scoped>
.pb-safe {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}
summary::-webkit-details-marker {
  display: none;
}
</style>
