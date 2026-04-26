<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { Wand2, X } from 'lucide-vue-next'
import {
  useMultiStepFormStore,
  newId,
  type MultiStepElement,
} from '../../../stores/multistepForm'
import { CATALOG, CATALOG_GROUPS, type CatalogEntry, type CatalogGroupKey } from '../utils/catalog'
import { useMultiStepUI } from '../composables/useMultiStepUI'

const store = useMultiStepFormStore()
const { isElementsOpen, isMobile, closeSheets } = useMultiStepUI()

const groupedCatalog = computed(() =>
  CATALOG_GROUPS.map(g => ({
    ...g,
    entries: CATALOG.filter(e => e.group === g.key),
  })).filter(g => g.entries.length > 0)
)

function add(type: (typeof CATALOG)[number]['type'], label: string) {
  store.addElement(type, label)
  if (isMobile.value) closeSheets()
}

function cloneFromCatalog(entry: CatalogEntry): MultiStepElement {
  const el: MultiStepElement = {
    id: newId(),
    type: entry.type,
    label: entry.label,
    placeholder: '',
    required: false,
  }
  if (entry.type === 'select' || entry.type === 'radio') {
    el.options = ['Option 1', 'Option 2']
  }
  return el
}

defineProps<{ groupKey?: CatalogGroupKey }>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isElementsOpen"
      @click="closeSheets"
      class="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-30 lg:hidden"
      aria-hidden="true"
    />
  </Transition>

  <aside
    :class="[
      'bg-white dark:bg-[#111118] flex flex-col',
      'lg:static lg:w-52 xl:w-60 lg:shrink-0 lg:translate-y-0 lg:border-e lg:border-slate-200 lg:dark:border-white/[0.07] lg:rounded-none lg:shadow-none lg:max-h-none lg:transition-none',
      'fixed inset-x-0 bottom-[52px] z-40 max-h-[70vh] rounded-t-2xl border-t border-slate-200 dark:border-white/[0.07] shadow-2xl shadow-black/20 dark:shadow-black/60 transition-transform duration-300 ease-out',
      isElementsOpen ? 'translate-y-0' : 'translate-y-[calc(100%+52px)] lg:translate-y-0',
    ]"
    aria-label="Element catalog"
  >
    <div class="p-4 border-b border-slate-200 dark:border-white/[0.05] flex items-center justify-between">
      <h2 class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em]">
        Elements
      </h2>
      <button
        type="button"
        @click="closeSheets"
        class="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/[0.07] transition-colors"
        aria-label="Close elements panel"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
    <div class="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
      <section
        v-for="group in groupedCatalog"
        :key="group.key"
        class="space-y-1.5"
      >
        <h3 class="px-1 text-[10px] font-semibold text-slate-400 dark:text-white/30 uppercase tracking-wider">
          {{ group.label }}
        </h3>
        <draggable
          :list="group.entries"
          item-key="type"
          :group="{ name: 'multistep-canvas', pull: 'clone', put: false }"
          :clone="cloneFromCatalog"
          :sort="false"
          :delay="150"
          :delay-on-touch-only="true"
          :touch-start-threshold="5"
          class="space-y-1.5"
        >
          <template #item="{ element: entry }">
            <button
              type="button"
              @click="add(entry.type, entry.label)"
              class="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-white/[0.06] hover:border-indigo-400 hover:bg-indigo-50 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/[0.06] transition-all group text-start lg:cursor-grab lg:active:cursor-grabbing"
              style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
              :aria-label="`Add ${entry.label} field`"
            >
              <div
                class="p-1.5 rounded-md bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-600 dark:bg-white/[0.05] dark:group-hover:bg-indigo-500/20 dark:text-white/50 dark:group-hover:text-indigo-300 transition-colors"
              >
                <component :is="entry.icon" class="h-3.5 w-3.5" />
              </div>
              <span class="text-[13px] font-medium text-slate-700 group-hover:text-indigo-700 dark:text-white/80 dark:group-hover:text-indigo-200">
                {{ entry.label }}
              </span>
            </button>
          </template>
        </draggable>
      </section>

      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
        style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
      >
        <Wand2 class="h-3.5 w-3.5" /> AI Suggest Fields
      </button>
    </div>
  </aside>
</template>
