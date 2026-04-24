import type { FormElement } from '../../stores/form'
import {
  buildCodegenTree,
  buildNameLookup,
  buildVisibilityExpr,
  componentNameFromTitle,
  defaultValueLiteral,
  escapeAttr,
  flattenFields,
  formAccess,
  optionsFallbackConstName,
  optionsMapConstName,
  serializeOptionsMap,
  tsTypeFor,
  type CodegenNode,
  type Field,
  type GeneratedComponent,
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

function visibilityAttr(field: Field, namesById: Record<string, string>): string {
  if (!field.visibility) return ''
  const expr = buildVisibilityExpr(field.visibility, namesById, 'vue')
  return expr ? ` v-if="${expr}"` : ''
}

function optionsIteration(field: Field, namesById: Record<string, string>): { expr: string | null } {
  if (!field.optionsSource) return { expr: null }
  const parentName = namesById[field.optionsSource.sourceId]
  if (!parentName) return { expr: null }
  const access = formAccess(parentName, 'vue')
  const mapName = optionsMapConstName(field.name)
  const fbName = optionsFallbackConstName(field.name)
  return { expr: `(${mapName}[${access}] ?? ${fbName})` }
}

function renderField(field: Field, namesById: Record<string, string>): string {
  const { name, placeholder, required, htmlInputType } = field
  const reqAttr = required ? ' required' : ''
  const phAttr = placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : ''
  const vIf = visibilityAttr(field, namesById)

  if (field.type === 'checkbox') {
    return `<label${vIf} class="flex items-start gap-3 cursor-pointer group">
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
    return `<div${vIf} class="space-y-2">
  ${renderLabel(field)}
  <input
    type="${htmlInputType}"
    v-model="form.${name}"${phAttr}${reqAttr}
    class="${INPUT_CLASS}"
  />
</div>`
  }

  if (field.type === 'textarea') {
    return `<div${vIf} class="space-y-2">
  ${renderLabel(field)}
  <textarea
    v-model="form.${name}"${phAttr}${reqAttr}
    rows="3"
    class="${INPUT_CLASS} resize-none"
  />
</div>`
  }

  if (field.type === 'select') {
    const dynamic = optionsIteration(field, namesById)
    const opts = dynamic.expr
      ? `    <option v-for="o in ${dynamic.expr}" :key="o" :value="o">{{ o }}</option>`
      : field.options.length
      ? field.options
          .map(o => `    <option value="${escapeAttr(o)}">${escapeAttr(o)}</option>`)
          .join('\n')
      : '    <!-- TODO: add options -->'
    return `<div${vIf} class="space-y-2">
  ${renderLabel(field)}
  <select v-model="form.${name}"${reqAttr} class="${INPUT_CLASS}">
    <option value="" disabled>Select an option</option>
${opts}
  </select>
</div>`
  }

  if (field.type === 'radio') {
    const dynamic = optionsIteration(field, namesById)
    const opts = dynamic.expr
      ? `    <label v-for="o in ${dynamic.expr}" :key="o" class="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name="${name}"
        :value="o"
        v-model="form.${name}"${reqAttr}
        class="h-4 w-4 border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.04] text-indigo-600 focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
      />
      <span class="text-sm text-slate-700 dark:text-white/80 select-none">{{ o }}</span>
    </label>`
      : field.options.length
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
    return `<div${vIf} class="space-y-2">
  ${renderLabel(field)}
  <div class="space-y-2">
${opts}
  </div>
</div>`
  }

  if (field.type === 'file') {
    return `<div${vIf} class="space-y-2">
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

function renderNode(
  node: CodegenNode,
  depth: number,
  namesById: Record<string, string>
): string {
  const pad = '      '.repeat(1) + '  '.repeat(depth)
  if (node.kind === 'row') {
    const children = node.children
      .map(c => renderNode(c, depth + 1, namesById))
      .join('\n')
    return `${pad}<div class="flex gap-4">
${children}
${pad}</div>`
  }
  return node.field ? indentBlock(renderField(node.field, namesById), pad) : ''
}

function indentBlock(block: string, pad: string): string {
  return block
    .split('\n')
    .map(l => (l.length === 0 ? l : pad + l))
    .join('\n')
}

function buildOptionsConstants(fields: Field[], namesById: Record<string, string>): string {
  const lines: string[] = []
  for (const f of fields) {
    if (!f.optionsSource) continue
    if (!namesById[f.optionsSource.sourceId]) continue
    const mapConst = optionsMapConstName(f.name)
    const fbConst = optionsFallbackConstName(f.name)
    lines.push(
      `const ${mapConst}: Record<string, string[]> = ${serializeOptionsMap(f.optionsSource.map)}`
    )
    lines.push(
      `const ${fbConst}: string[] = ${JSON.stringify(f.optionsSource.fallback ?? [])}`
    )
  }
  return lines.length ? lines.join('\n') + '\n\n' : ''
}

export function generateVueComponent(
  elements: FormElement[],
  title: string
): GeneratedComponent {
  const tree = buildCodegenTree(elements)
  const fields = flattenFields(tree)
  const namesById = buildNameLookup(tree)
  const componentName = componentNameFromTitle(title)

  const interfaceLines = fields.length
    ? fields.map(f => `  ${f.name}: ${tsTypeFor(f)}`).join('\n')
    : '  // TODO: add fields'

  const initialLines = fields.length
    ? fields.map(f => `  ${f.name}: ${defaultValueLiteral(f)},`).join('\n')
    : '  // empty form'

  const optionsConstants = buildOptionsConstants(fields, namesById)
  const markup = tree.map(n => renderNode(n, 0, namesById)).join('\n')
  const titleText = title || 'Form'

  const code = `<script setup lang="ts">
import { reactive } from 'vue'

interface FormValues {
${interfaceLines}
}

${optionsConstants}const form = reactive<FormValues>({
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
