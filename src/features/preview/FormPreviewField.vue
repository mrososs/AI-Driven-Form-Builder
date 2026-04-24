<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { FormElement } from '../../stores/form'
import { HTML_INPUT_TYPE } from '../../utils/codegen/shared'

defineOptions({ name: 'FormPreviewField' })
const props = defineProps<{ element: FormElement }>()

const htmlInputType = computed(() => HTML_INPUT_TYPE[props.element.type])
</script>

<template>
  <div>
    <!-- Row: side-by-side columns -->
    <div v-if="element.type === 'row'" class="flex gap-4">
      <div v-for="child in element.children" :key="child.id" class="flex-1 min-w-0">
        <FormPreviewField :element="child" />
      </div>
    </div>

    <!-- Checkbox: inline, no separate label above -->
    <label
      v-else-if="element.type === 'checkbox'"
      class="flex items-start gap-3 cursor-pointer group"
    >
      <input
        type="checkbox"
        :required="element.required"
        class="mt-0.5 h-4 w-4 shrink-0 rounded
               border-slate-300 dark:border-white/20
               bg-white dark:bg-white/[0.04]
               text-indigo-600
               focus:ring-2 focus:ring-indigo-500/40
               cursor-pointer"
      />
      <span
        class="text-sm transition-colors select-none leading-relaxed
               text-slate-700 dark:text-white/80
               group-hover:text-slate-900 dark:group-hover:text-white"
      >
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ml-0.5">*</span>
      </span>
    </label>

    <!-- All labeled fields -->
    <div v-else class="space-y-2">
      <label class="block text-sm font-medium leading-none text-slate-700 dark:text-white/80">
        {{ element.label }}
        <span v-if="element.required" class="text-rose-500 dark:text-rose-400 ml-0.5">*</span>
      </label>

      <input
        v-if="htmlInputType"
        :type="htmlInputType"
        :placeholder="element.placeholder || ''"
        :required="element.required"
        class="w-full px-3.5 py-2.5 text-sm rounded-lg transition-colors
                 text-slate-800 dark:text-white
                 bg-white dark:bg-white/[0.04]
                 border border-slate-200 dark:border-white/10
                 placeholder:text-slate-400 dark:placeholder:text-white/30
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-400"
      />

      <textarea
        v-else-if="element.type === 'textarea'"
        :placeholder="element.placeholder || ''"
        :required="element.required"
        rows="3"
        class="w-full px-3.5 py-2.5 text-sm rounded-lg transition-colors resize-none
               text-slate-800 dark:text-white
               bg-white dark:bg-white/[0.04]
               border border-slate-200 dark:border-white/10
               placeholder:text-slate-400 dark:placeholder:text-white/30
               focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-400"
      />

      <div v-else-if="element.type === 'select'" class="relative">
        <select
          :required="element.required"
          class="preview-select w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg transition-colors cursor-pointer
                 text-slate-800 dark:text-white
                 bg-white dark:bg-white/[0.04]
                 border border-slate-200 dark:border-white/10
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-400"
        >
          <option value="" disabled selected>Select an option</option>
          <option v-for="opt in element.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <ChevronDown
          class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-slate-400 dark:text-white/50"
          aria-hidden="true"
        />
      </div>

      <div v-else-if="element.type === 'radio'" class="space-y-2">
        <label
          v-for="opt in element.options"
          :key="opt"
          class="flex items-center gap-3 cursor-pointer group"
        >
          <input
            type="radio"
            :name="element.id"
            :value="opt"
            :required="element.required"
            class="h-4 w-4 shrink-0
                   border-slate-300 dark:border-white/20
                   bg-white dark:bg-white/[0.04]
                   text-indigo-600
                   focus:ring-2 focus:ring-indigo-500/40
                   cursor-pointer"
          />
          <span class="text-sm text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white select-none">
            {{ opt }}
          </span>
        </label>
      </div>

      <input
        v-else-if="element.type === 'file'"
        type="file"
        :required="element.required"
        class="w-full text-sm text-slate-700 dark:text-white/80
               file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
               file:text-sm file:font-medium
               file:bg-indigo-50 dark:file:bg-indigo-500/10
               file:text-indigo-700 dark:file:text-indigo-300
               hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20
               cursor-pointer"
      />
    </div>
  </div>
</template>

<style scoped>
/* Suppress the native select arrow across all browsers. */
.preview-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: none;
  color-scheme: light;
}
.preview-select::-ms-expand {
  display: none;
}
</style>

<!-- Non-scoped: the `.dark` ancestor lives on <html>, which Vue's scoped
     rewriting can't reach. This tells the browser to render the OS-level
     options popup in dark system colors when dark mode is active. -->
<style>
.dark .preview-select { color-scheme: dark; }
.dark .preview-select option {
  background-color: #13131c;
  color: #ffffff;
}
</style>
