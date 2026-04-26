<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { Wand2 } from 'lucide-vue-next'
import {
  useMultiStepFormStore,
  newId,
  type MultiStepElement,
} from '../../../stores/multistepForm'
import { CATALOG, CATALOG_GROUPS, type CatalogEntry, type CatalogGroupKey } from '../utils/catalog'

const store = useMultiStepFormStore()

const groupedCatalog = computed(() =>
  CATALOG_GROUPS.map(g => ({
    ...g,
    entries: CATALOG.filter(e => e.group === g.key),
  })).filter(g => g.entries.length > 0)
)

function add(type: (typeof CATALOG)[number]['type'], label: string) {
  store.addElement(type, label)
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
  <aside
    class="w-60 shrink-0 bg-white dark:bg-[#111118] border-e border-slate-200 dark:border-white/[0.07] flex flex-col"
    aria-label="Element catalog"
  >
    <div class="p-4 border-b border-slate-200 dark:border-white/[0.05]">
      <h2 class="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.14em]">
        Elements
      </h2>
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
              class="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-white/[0.06] hover:border-indigo-400 hover:bg-indigo-50 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/[0.06] transition-all group text-start md:cursor-grab md:active:cursor-grabbing"
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
