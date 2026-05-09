<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import { GripVertical, Settings2, Trash2 } from 'lucide-vue-next'
import {
  useMultiStepFormStore,
  type MultiStepElement,
} from '../../../stores/multistepForm'
import ElementCard from './ElementCard.vue'

const props = defineProps<{
  element: MultiStepElement
  selected: boolean
}>()

const emit = defineEmits<{
  select: []
  remove: []
}>()

const store = useMultiStepFormStore()

const rowChildren = computed({
  get: () => props.element.children ?? [],
  set: (next) => store.setRowChildren(props.element.id, next),
})

function rejectRowDrag(evt: { draggedContext: { element: MultiStepElement } }) {
  return evt.draggedContext.element.type !== 'row'
}

function onChildAdded(event: { newIndex: number }) {
  const dropped = rowChildren.value[event.newIndex]
  if (dropped?.type === 'row') {
    const next = [...rowChildren.value]
    next.splice(event.newIndex, 1)
    rowChildren.value = next
    return
  }
  if (dropped) store.selectElement(dropped.id)
}
</script>

<template>
  <div
    @click="emit('select')"
    :class="[
      'group relative rounded-xl border p-5 transition-all duration-200',
      selected
        ? 'border-indigo-500 bg-indigo-50/60 shadow-lg shadow-indigo-500/10 dark:border-indigo-500/50 dark:bg-[#13131a]'
        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md dark:border-white/[0.07] dark:bg-[#111118] dark:hover:border-indigo-500/30 dark:hover:shadow-black/30',
    ]"
    style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
  >
    <div
      class="hidden md:block absolute -start-3 top-1/2 -translate-y-1/2 drag-handle cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 dark:bg-[#111118] dark:border-white/[0.07] rounded-md p-1 shadow-md"
      aria-label="Drag to reorder"
    >
      <GripVertical class="h-3.5 w-3.5 text-slate-400 dark:text-white/40" />
    </div>

    <div class="flex justify-between items-start mb-3 gap-2">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span
          class="md:hidden drag-handle cursor-grab active:cursor-grabbing p-1 -ms-1 text-slate-400 dark:text-white/30 shrink-0"
          aria-label="Drag to reorder"
          @click.stop
        >
          <GripVertical class="h-4 w-4" aria-hidden="true" />
        </span>
        <input
          :value="element.label"
          @click.stop
          @input="store.updateElement(element.id, { label: ($event.target as HTMLInputElement).value })"
          class="font-semibold text-slate-900 dark:text-white w-full bg-transparent border-none p-0 text-sm focus:outline-none"
          aria-label="Row label"
        />
      </div>
      <div class="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          @click.stop="emit('select')"
          :class="[
            'p-2 md:p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
            selected
              ? 'text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-500/10'
              : 'text-slate-500 hover:text-indigo-600 dark:text-white/50 dark:hover:text-indigo-300',
          ]"
          aria-label="Edit row"
        >
          <Settings2 class="h-4 w-4 md:h-3.5 md:w-3.5" />
        </button>
        <button
          type="button"
          @click.stop="emit('remove')"
          class="p-2 md:p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-white/50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
          aria-label="Delete row"
        >
          <Trash2 class="h-4 w-4 md:h-3.5 md:w-3.5" />
        </button>
      </div>
    </div>

    <div
      class="rounded-xl border border-dashed border-slate-300 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] p-3"
      @click.stop
    >
      <draggable
        v-model="rowChildren"
        item-key="id"
        :group="{ name: 'multistep-canvas', put: true }"
        :move="rejectRowDrag"
        handle=".drag-handle"
        :delay="150"
        :delay-on-touch-only="true"
        :touch-start-threshold="5"
        ghost-class="ms-drag-ghost"
        class="flex flex-wrap gap-3 min-h-[80px]"
        @add="onChildAdded"
      >
        <template #item="{ element: child }">
          <div class="flex-1 min-w-[180px] basis-0">
            <ElementCard
              :element="child"
              :selected="store.selectedElementId === child.id"
              @select="store.selectElement(child.id)"
              @remove="store.removeElement(child.id)"
              @update="(patch) => store.updateElement(child.id, patch)"
            />
          </div>
        </template>
        <template #footer>
          <div
            v-if="rowChildren.length === 0"
            class="flex-1 flex items-center justify-center text-[12px] text-slate-500 dark:text-white/30 italic font-medium py-6"
          >
            Drag fields here to build columns
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped>
:deep(.drag-handle) {
  touch-action: none;
}

.ms-drag-ghost {
  opacity: 0.4;
}
</style>
