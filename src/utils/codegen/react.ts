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

function requiredMark(field: Field): string {
  return field.required
    ? ' <span className="text-rose-500 dark:text-rose-400 ml-0.5">*</span>'
    : ''
}

function renderLabel(field: Field): string {
  return `<label className="${LABEL_CLASS}">${escapeAttr(field.label)}${requiredMark(field)}</label>`
}

function renderField(field: Field): string {
  const { name, placeholder, required, htmlInputType } = field
  const reqAttr = required ? ' required' : ''
  const phAttr = placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : ''

  if (field.type === 'checkbox') {
    return `<label className="flex items-start gap-3 cursor-pointer group">
  <input
    type="checkbox"
    checked={form.${name}}
    onChange={e => setForm(prev => ({ ...prev, ${name}: e.target.checked }))}${reqAttr}
    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.04] text-indigo-600 focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
  />
  <span className="text-sm text-slate-700 dark:text-white/80 select-none leading-relaxed">
    ${escapeAttr(field.label)}${requiredMark(field)}
  </span>
</label>`
  }

  if (htmlInputType) {
    return `<div className="space-y-2">
  ${renderLabel(field)}
  <input
    type="${htmlInputType}"
    value={form.${name}}
    onChange={e => setForm(prev => ({ ...prev, ${name}: e.target.value }))}${phAttr}${reqAttr}
    className="${INPUT_CLASS}"
  />
</div>`
  }

  if (field.type === 'textarea') {
    return `<div className="space-y-2">
  ${renderLabel(field)}
  <textarea
    value={form.${name}}
    onChange={e => setForm(prev => ({ ...prev, ${name}: e.target.value }))}${phAttr}${reqAttr}
    rows={3}
    className="${INPUT_CLASS} resize-none"
  />
</div>`
  }

  if (field.type === 'select') {
    const opts = field.options.length
      ? field.options
          .map(
            o => `    <option key="${escapeAttr(o)}" value="${escapeAttr(o)}">${escapeAttr(o)}</option>`
          )
          .join('\n')
      : '    {/* TODO: add options */}'
    return `<div className="space-y-2">
  ${renderLabel(field)}
  <select
    value={form.${name}}
    onChange={e => setForm(prev => ({ ...prev, ${name}: e.target.value }))}${reqAttr}
    className="${INPUT_CLASS}"
  >
    <option value="" disabled>Select an option</option>
${opts}
  </select>
</div>`
  }

  if (field.type === 'radio') {
    const opts = field.options.length
      ? field.options
          .map(
            o => `    <label key="${escapeAttr(o)}" className="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name="${name}"
        value="${escapeAttr(o)}"
        checked={form.${name} === "${escapeAttr(o)}"}
        onChange={() => setForm(prev => ({ ...prev, ${name}: "${escapeAttr(o)}" }))}${reqAttr}
        className="h-4 w-4 border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.04] text-indigo-600 focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
      />
      <span className="text-sm text-slate-700 dark:text-white/80 select-none">${escapeAttr(o)}</span>
    </label>`
          )
          .join('\n')
      : '    {/* TODO: add options */}'
    return `<div className="space-y-2">
  ${renderLabel(field)}
  <div className="space-y-2">
${opts}
  </div>
</div>`
  }

  if (field.type === 'file') {
    return `<div className="space-y-2">
  ${renderLabel(field)}
  <input
    type="file"
    onChange={e => setForm(prev => ({ ...prev, ${name}: e.target.files?.[0]?.name ?? '' }))}${reqAttr}
    className="w-full text-sm text-slate-700 dark:text-white/80 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-500/10 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20 cursor-pointer"
  />
</div>`
  }

  return `{/* Unsupported field type: ${field.type} */}`
}

function renderNode(node: CodegenNode, depth: number): string {
  const pad = '      '.repeat(1) + '  '.repeat(depth)
  if (node.kind === 'row') {
    const children = node.children
      .map(c => renderNode(c, depth + 1))
      .join('\n')
    return `${pad}<div className="flex gap-4">
${children}
${pad}</div>`
  }
  return indentBlock(renderField(node.field), pad)
}

function indentBlock(block: string, pad: string): string {
  return block
    .split('\n')
    .map(l => (l.length === 0 ? l : pad + l))
    .join('\n')
}

export function generateReactComponent(
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

  const code = `import { useState, type FormEvent } from 'react'

interface FormValues {
${interfaceLines}
}

const initialValues: FormValues = {
${initialLines}
}

export default function ${componentName}() {
  const [form, setForm] = useState<FormValues>(initialValues)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log('${escapeAttr(titleText)} submitted:', form)
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl mx-auto space-y-4">
${markup}
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
      >
        Submit
      </button>
    </form>
  )
}
`

  return {
    code,
    filename: `${componentName}.tsx`,
    language: 'tsx',
  }
}
