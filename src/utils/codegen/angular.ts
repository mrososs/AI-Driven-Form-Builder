import type { FormElement } from '../../stores/form'
import {
  buildCodegenTree,
  buildNameLookup,
  buildVisibilityExpr,
  componentNameFromTitle,
  escapeAttr,
  flattenFields,
  serializeOptionsMap,
  slugify,
  type CodegenNode,
  type Field,
  type GeneratedComponent,
} from './shared.js'

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 text-sm rounded-lg transition-colors text-slate-800 dark:text-white bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-400'

const LABEL_CLASS =
  'block text-sm font-medium leading-none text-slate-700 dark:text-white/80'

function requiredMark(field: Field): string {
  return field.required
    ? ' <span class="text-rose-500 dark:text-rose-400 ml-0.5">*</span>'
    : ''
}

function renderLabel(field: Field): string {
  return `<label class="${LABEL_CLASS}">${escapeAttr(field.label)}${requiredMark(field)}</label>`
}

function hasDynamicOptions(field: Field, namesById: Record<string, string>): boolean {
  return !!(field.optionsSource && namesById[field.optionsSource.sourceId])
}

function dynamicOptionsGetter(field: Field): string {
  return `${field.name}Options`
}

function renderField(field: Field, namesById: Record<string, string>): string {
  const { name, placeholder, htmlInputType } = field
  const phAttr = placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : ''

  if (field.type === 'checkbox') {
    return `<label class="flex items-start gap-3 cursor-pointer group">
  <input
    type="checkbox"
    formControlName="${name}"
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
    formControlName="${name}"${phAttr}
    class="${INPUT_CLASS}"
  />
</div>`
  }

  if (field.type === 'textarea') {
    return `<div class="space-y-2">
  ${renderLabel(field)}
  <textarea
    formControlName="${name}"${phAttr}
    rows="3"
    class="${INPUT_CLASS} resize-none"
  ></textarea>
</div>`
  }

  if (field.type === 'select') {
    const dynamic = hasDynamicOptions(field, namesById)
    const opts = dynamic
      ? `    @for (o of ${dynamicOptionsGetter(field)}; track o) {
      <option [value]="o">{{ o }}</option>
    }`
      : field.options.length
      ? field.options
          .map(o => `    <option value="${escapeAttr(o)}">${escapeAttr(o)}</option>`)
          .join('\n')
      : '    <!-- TODO: add options -->'
    return `<div class="space-y-2">
  ${renderLabel(field)}
  <select formControlName="${name}" class="${INPUT_CLASS}">
    <option value="" disabled>Select an option</option>
${opts}
  </select>
</div>`
  }

  if (field.type === 'radio') {
    const dynamic = hasDynamicOptions(field, namesById)
    const opts = dynamic
      ? `    @for (o of ${dynamicOptionsGetter(field)}; track o) {
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          formControlName="${name}"
          [value]="o"
          class="h-4 w-4 border-slate-300 dark:border-white/20 bg-white dark:bg-white/[0.04] text-indigo-600 focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
        />
        <span class="text-sm text-slate-700 dark:text-white/80 select-none">{{ o }}</span>
      </label>
    }`
      : field.options.length
      ? field.options
          .map(
            o => `    <label class="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        formControlName="${name}"
        value="${escapeAttr(o)}"
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
    (change)="on${capitalize(name)}FileChange($event)"
    class="w-full text-sm text-slate-700 dark:text-white/80 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-500/10 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20 cursor-pointer"
  />
</div>`
  }

  return `<!-- Unsupported field type: ${field.type} -->`
}

function wrapVisibility(
  block: string,
  field: Field,
  namesById: Record<string, string>
): string {
  if (!field.visibility) return block
  const expr = buildVisibilityExpr(field.visibility, namesById, 'angular')
  if (!expr) return block
  const inner = block
    .split('\n')
    .map(l => (l.length === 0 ? l : '  ' + l))
    .join('\n')
  return `@if (${expr}) {\n${inner}\n}`
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
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
  const wrapped = wrapVisibility(renderField(node.field, namesById), node.field, namesById)
  return indentBlock(wrapped, pad)
}

function indentBlock(block: string, pad: string): string {
  return block
    .split('\n')
    .map(l => (l.length === 0 ? l : pad + l))
    .join('\n')
}

function formControlLine(field: Field): string {
  const validators: string[] = []
  if (field.required) {
    validators.push(field.type === 'checkbox' ? 'Validators.requiredTrue' : 'Validators.required')
  }
  const initial = field.type === 'checkbox' ? 'false' : "''"
  if (validators.length === 0) {
    return `    ${field.name}: [${initial}],`
  }
  return `    ${field.name}: [${initial}, [${validators.join(', ')}]],`
}

function buildDynamicOptionsMembers(
  fields: Field[],
  namesById: Record<string, string>
): string {
  const lines: string[] = []
  for (const f of fields) {
    if (!f.optionsSource) continue
    const parentName = namesById[f.optionsSource.sourceId]
    if (!parentName) continue
    const mapProp = `optionsMap_${f.name}`
    const fbProp = `optionsFallback_${f.name}`
    lines.push(
      `  readonly ${mapProp}: Record<string, string[]> = ${serializeOptionsMap(f.optionsSource.map)}`
    )
    lines.push(
      `  readonly ${fbProp}: string[] = ${JSON.stringify(f.optionsSource.fallback ?? [])}`
    )
    lines.push(
      `  get ${f.name}Options(): string[] {
    const v = this.form.get('${parentName}')?.value
    return this.${mapProp}[v] ?? this.${fbProp}
  }`
    )
  }
  return lines.length ? '\n' + lines.join('\n') + '\n' : ''
}

export function generateAngularComponent(
  elements: FormElement[],
  title: string
): GeneratedComponent {
  const tree = buildCodegenTree(elements)
  const fields = flattenFields(tree)
  const namesById = buildNameLookup(tree)
  const classBase = componentNameFromTitle(title)
  const className = classBase.endsWith('Component') ? classBase : classBase + 'Component'
  const selectorBase = slugify(classBase) || 'exported-form'
  const selector = `app-${selectorBase}`
  const fileBase = selectorBase.endsWith('-form') ? selectorBase : `${selectorBase}-form`

  const controls = fields.length
    ? fields.map(formControlLine).join('\n')
    : '    // TODO: add controls'

  const markup = tree.map(n => renderNode(n, 0, namesById)).join('\n')
  const titleText = title || 'Form'

  const fileHandlers = fields
    .filter(f => f.type === 'file')
    .map(
      f => `
  on${capitalize(f.name)}FileChange(event: Event): void {
    const input = event.target as HTMLInputElement
    const fileName = input.files?.[0]?.name ?? ''
    this.form.patchValue({ ${f.name}: fileName })
  }`
    )
    .join('')

  const dynamicOptionsMembers = buildDynamicOptionsMembers(fields, namesById)

  const interfaceLines = fields.length
    ? fields
        .map(f => `  ${f.name}${f.required ? '' : '?'}: ${f.type === 'checkbox' ? 'boolean' : 'string'}`)
        .join('\n')
    : '  // TODO: add fields'

  const BACKTICK = '`'
  const template = `${BACKTICK}
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="w-full max-w-xl mx-auto space-y-4">
${markup}
      <button
        type="submit"
        [disabled]="form.invalid"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit
      </button>
    </form>
  ${BACKTICK}`

  const code = `import { Component, inject } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'

interface ${classBase}Values {
${interfaceLines}
}

@Component({
  selector: '${selector}',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: ${template},
})
export class ${className} {
  private readonly fb = inject(FormBuilder)

  readonly form: FormGroup = this.fb.group({
${controls}
  })
${dynamicOptionsMembers}
  onSubmit(): void {
    if (this.form.invalid) return
    const values = this.form.value as ${classBase}Values
    console.log('${escapeAttr(titleText)} submitted:', values)
  }${fileHandlers}
}
`

  return {
    code,
    filename: `${fileBase}.component.ts`,
    language: 'ts',
  }
}
