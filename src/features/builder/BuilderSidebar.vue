<script setup lang="ts">
import draggable from "vuedraggable";
import { Wand2, X } from "lucide-vue-next";
import type { FormElement } from "../../stores/form";
import { useFormStore } from "../../stores/form";
import { ELEMENT_GROUPS, type ElementDefinition } from "./elements";
import { useBuilderUI } from "../../composables/useBuilderUI";

const formStore = useFormStore();
const { isElementsOpen, isMobile, closeSheets } = useBuilderUI();

function cloneElement(original: ElementDefinition): FormElement {
  return original.createDefault();
}

function addElementByTap(original: ElementDefinition) {
  formStore.addElement(original.createDefault());
  if (isMobile.value) closeSheets();
}
</script>

<template>
  <!-- Mobile sheet backdrop -->
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
      class="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-30 md:hidden"
      aria-hidden="true"
    />
  </Transition>

  <aside
    :class="[
      'bg-white dark:bg-[#111118] flex flex-col',
      'md:static md:w-72 md:translate-y-0 md:border-r md:border-slate-200 md:dark:border-white/[0.07]',
      'fixed inset-x-0 bottom-0 z-40 max-h-[80vh] rounded-t-2xl border-t border-slate-200 dark:border-white/[0.07] shadow-2xl shadow-black/20 dark:shadow-black/60 transition-transform duration-300 ease-out md:rounded-t-none md:shadow-none md:max-h-none md:transition-none',
      isElementsOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0',
    ]"
    aria-label="Form elements"
  >
    <div
      class="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 dark:border-white/[0.05]"
    >
      <h2
        class="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider"
      >
        Elements
      </h2>
      <button
        @click="closeSheets"
        class="md:hidden p-1.5 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07] rounded-lg"
        aria-label="Close elements panel"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <div class="p-4 space-y-5 overflow-y-auto flex-1 pb-safe">
      <p class="md:hidden text-[11px] text-slate-500 dark:text-white/40 -mt-1">
        Tap an element to add it to the form.
      </p>

      <section
        v-for="group in ELEMENT_GROUPS"
        :key="group.key"
        class="space-y-2"
      >
        <h3
          class="px-1 text-[10px] font-semibold text-slate-400 dark:text-white/30 uppercase tracking-wider"
        >
          {{ group.label }}
        </h3>

        <draggable
          :list="group.elements"
          item-key="type"
          :group="{ name: 'canvas', pull: 'clone', put: false }"
          :clone="cloneElement"
          :sort="false"
          :delay="150"
          :delay-on-touch-only="true"
          :touch-start-threshold="5"
          class="space-y-2"
        >
          <template #item="{ element }">
            <button
              type="button"
              @click="addElementByTap(element)"
              class="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/[0.07] hover:border-primary-400 dark:hover:border-indigo-500/50 hover:bg-primary-50 dark:hover:bg-indigo-500/10 transition-all group text-left md:cursor-grab md:active:cursor-grabbing"
              :aria-label="`Add ${element.label} field`"
            >
              <div
                class="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.06] group-hover:bg-primary-100 dark:group-hover:bg-indigo-500/20 text-slate-500 dark:text-white/50 group-hover:text-primary-600 dark:group-hover:text-indigo-400 transition-colors"
              >
                <component :is="element.icon" class="h-4 w-4" />
              </div>
              <span
                class="text-sm font-medium text-slate-700 dark:text-white/80 group-hover:text-primary-700 dark:group-hover:text-indigo-300"
                >{{ element.label }}</span
              >
            </button>
          </template>
        </draggable>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.pb-safe {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
</style>
