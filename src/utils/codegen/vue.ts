import type { FormElement } from '../../stores/form'
import {
  type CodegenNode,
  type Field,
  type GeneratedComponent,
  buildCodegenTree,
  componentNameFromTitle,
  defaultValueLiteral,
  escapeAttr,
  flattenFields,
  tsTypeFor,
} from './shared'

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 text-sm rounded-lg transition-colors text-slate-800 dark:text-white bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-400'

const LABEL_CLASS =
  'block text-sm font-medium leading-none text-slate-700 dark:text-white/80'

const REQUIRED_STAR = ' <span class="text-rose-500 dark:text-rose-400 ml-0.5">*</span>'

function requiredMark(field: Field): string {
  return field.required ? REQUIRED_STAR : ''
}

function renderLabel(field: Field): string {
  return `<label class="${LABEL_CLASS}">${escapeAttr(field.label)}${requiredMark(field)}</label>`
}

function renderField(field: Field): string {
  const { name, placeholder, required, htmlInputType } = field
  const reqAttr = required ? ' required' : ''
  const phAttr = placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : ''

  if (field.type === 'checkbox') {
    return `<label class="flex items-start gap-3 cursor-pointer group">
  <input
    type="checkbox"
    v-model="form.${name}"${reqAttr}
    class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.04] text-indigo-600 focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
  />
  <span class="text-sm text-slate-700 dark:text-white/80 select-none leading-relaxed">
    ${escapeAttr(field.label)}${requiredMark(field)}
  </span>
</label>`
  }

  if (htmlInputType) {
    return `<div class="space-y-2">
  ${renderLabel(field)}
  <input
    type="${htmlInputType}"
    v-model="form.${name}"${phAttr}${reqAttr}
    class="${INPUT_CLASS}"
  />
</div>`
  }

  if (field.type === 'textarea') {
    return `<div class="space-y-2">
  ${renderLabel(field)}
  <textarea
    v-model="form.${name}"${phAttr}${reqAttr}
    rows="3"
    class="${INPUT_CLASS} resize-none"
  />
</div>`
  }

  if (field.type === 'select') {
    const opts = field.options.length
      ? field.options
          .map(o => `    <option value="${escapeAttr(o)}">${escapeAttr(o)}</option>`)
          .join('\n')
      : '    <!-- TODO: add options -->'
    return `<div class="space-y-2">
  ${renderLabel(field)}
  <select v-model="form.${name}"${reqAttr} class="${INPUT_CLASS}">
    <option value="" disabled>Select an option</option>
${opts}
  </select>
</div>`
  }

  if (field.type === 'radio') {
    const opts = field.options.length
      ? field.options
          .map(
            o => `    <label class="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name="${name}"
        value="${escapeAttr(o)}"
        v-model="form.${name}"${reqAttr}
        class="h-4 w-4 border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.04] text-indigo-600 focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
      />
      <span class="text-sm text-slate-700 dark:text-white/80 select-none">${escapeAttr(o)}</span>
    </label>`
          )
          .join('\n')
      : '    <!-- TODO: add options -->'
    return `<div class="space-y-2">
  ${renderLabel(field)}
  <div class="space-y-2">
${opts}
  </div>
</div>`
  }

  if (field.type === 'file') {
    return `<div class="space-y-2">
  ${renderLabel(field)}
  <input
    type="file"
    @change="form.${name} = ($event.target as HTMLInputElement).files?.[0]?.name ?? ''"${reqAttr}
    class="w-full text-sm text-slate-700 dark:text-white/80 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-500/10 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20 cursor-pointer"
  />
</div>`
  }

  return `<!-- Unsupported field type: ${field.type} -->`
}

function renderNode(node: CodegenNode, depth: number): string {
  const pad = '      '.repeat(1) + '  '.repeat(depth)
  if (node.kind === 'row') {
    const children = node.children
      .map(c => renderNode(c, depth + 1))
      .join('\n')
    return `${pad}<div class="flex gap-4">
${children}
${pad}</div>`
  }
  return node.field ? indentBlock(renderField(node.field), pad) : ''
}

function indentBlock(block: string, pad: string): string {
  return block
    .split('\n')
    .map(l => (l.length === 0 ? l : pad + l))
    .join('\n')
}

export function generateVueComponent(
  elements: FormElement[],
  title: string
): GeneratedComponent {
  const tree = buildCodegenTree(elements)
  const fields = flattenFields(tree)
  const componentName = componentNameFromTitle(title)

  const interfaceLines = fields.length
    ? fields.map(f => `  ${f.name}: ${tsTypeFor(f)}`).join('\n')
    : '  // TODO: add fields'

  const initialLines = fields.length
    ? fields.map(f => `  ${f.name}: ${defaultValueLiteral(f)},`).join('\n')
    : '  // empty form'

  const markup = tree.map(n => renderNode(n, 0)).join('\n')
  const titleText = title || 'Form'

  const code = `<script setup lang="ts">
import { reactive } from 'vue'

interface FormValues {
${interfaceLines}
}

const form = reactive<FormValues>({
${initialLines}
})

function onSubmit() {
  console.log('${escapeAttr(titleText)} submitted:', form)
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="w-full max-w-xl mx-auto space-y-4">
${markup}
    <button
      type="submit"
      class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
    >
      Submit
    </button>
  </form>
</template>
`

  return {
    code,
    filename: `${componentName}.vue`,
    language: 'vue',
  }
}
