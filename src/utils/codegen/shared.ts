import type { FormElement, OptionsMap, VisibilityRule } from '../../stores/form'

export type Framework = 'vue' | 'react' | 'angular'

export interface GeneratedComponent {
  code: string
  filename: string
  language: 'vue' | 'tsx' | 'ts'
}

export const HTML_INPUT_TYPE: Record<string, string> = {
  text: 'text',
  number: 'number',
  email: 'email',
  phone: 'tel',
  url: 'url',
  date: 'date',
  time: 'time',
  datetime: 'datetime-local',
}

export interface Field {
  id: string
  type: string
  label: string
  placeholder: string
  required: boolean
  options: string[]
  name: string
  htmlInputType: string | null
  visibility?: VisibilityRule
  optionsSource?: OptionsMap
}

export type CodegenNode =
  | { kind: 'row'; children: CodegenNode[] }
  | { kind: 'field'; field: Field }

const JS_RESERVED = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new',
  'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try',
  'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static',
  'implements', 'interface', 'package', 'private', 'protected', 'public',
])

export function toCamelCase(input: string): string {
  const ascii = input.replace(/[^a-zA-Z0-9\s_-]/g, ' ')
  const parts = ascii.split(/[\s_-]+/).filter(Boolean)
  if (parts.length === 0) return ''
  const [first, ...rest] = parts
  const head = first.toLowerCase()
  const tail = rest.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
  let out = [head, ...tail].join('')
  if (/^[0-9]/.test(out)) out = 'f' + out
  if (JS_RESERVED.has(out)) out = out + '_'
  return out
}

export function toPascalCase(input: string): string {
  const camel = toCamelCase(input)
  if (!camel) return ''
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

export function slugify(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\s_-]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function componentNameFromTitle(title: string): string {
  const pascal = toPascalCase(title || '')
  if (!pascal) return 'ExportedForm'
  return pascal.endsWith('Form') ? pascal : pascal + 'Form'
}

export function indent(text: string, level: number): string {
  const pad = '  '.repeat(level)
  return text
    .split('\n')
    .map(line => (line.length === 0 ? line : pad + line))
    .join('\n')
}

export function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function toDoubleQuoted(value: string): string {
  return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

export function toSingleQuoted(value: string): string {
  return "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
}

interface NameAllocator {
  claim(preferred: string, fallbackIndex: number): string
}

function createNameAllocator(): NameAllocator {
  const used = new Set<string>()
  return {
    claim(preferred, fallbackIndex) {
      const base = preferred || `field${fallbackIndex}`
      if (!used.has(base)) {
        used.add(base)
        return base
      }
      let n = 2
      while (used.has(`${base}${n}`)) n++
      const next = `${base}${n}`
      used.add(next)
      return next
    },
  }
}

export function buildCodegenTree(elements: FormElement[]): CodegenNode[] {
  const allocator = createNameAllocator()
  let fieldIndex = 0

  function walk(list: FormElement[]): CodegenNode[] {
    return list.map(el => {
      if (el.type === 'row') {
        return {
          kind: 'row' as const,
          children: walk(el.children ?? []),
        }
      }
      fieldIndex++
      const field: Field = {
        id: el.id,
        type: el.type,
        label: el.label,
        placeholder: el.placeholder ?? '',
        required: el.required,
        options: el.options ?? [],
        name: allocator.claim(toCamelCase(el.label), fieldIndex),
        htmlInputType: HTML_INPUT_TYPE[el.type] ?? null,
        visibility: el.visibility,
        optionsSource: el.optionsSource,
      }
      return { kind: 'field' as const, field }
    })
  }

  return walk(elements)
}

export function flattenFields(tree: CodegenNode[]): Field[] {
  const out: Field[] = []
  function visit(nodes: CodegenNode[]) {
    for (const n of nodes) {
      if (n.kind === 'row') visit(n.children)
      else out.push(n.field)
    }
  }
  visit(tree)
  return out
}

export function buildNameLookup(tree: CodegenNode[]): Record<string, string> {
  const out: Record<string, string> = {}
  function visit(nodes: CodegenNode[]) {
    for (const n of nodes) {
      if (n.kind === 'row') visit(n.children)
      else out[n.field.id] = n.field.name
    }
  }
  visit(tree)
  return out
}

export type FormDialect = 'vue' | 'react' | 'angular'

export function formAccess(name: string, dialect: FormDialect): string {
  if (dialect === 'angular') return `form.get('${name}')?.value`
  return `form.${name}`
}

export function buildVisibilityExpr(
  rule: VisibilityRule,
  namesById: Record<string, string>,
  dialect: FormDialect
): string | null {
  const name = namesById[rule.sourceId]
  if (!name) return null
  const access = formAccess(name, dialect)
  switch (rule.operator) {
    case 'empty':
      return `!${access}`
    case 'notEmpty':
      return `!!${access}`
    case 'equals':
      return `${access} === ${JSON.stringify(String(rule.value ?? ''))}`
    case 'notEquals':
      return `${access} !== ${JSON.stringify(String(rule.value ?? ''))}`
    case 'in': {
      const arr = Array.isArray(rule.value) ? rule.value.map(String) : []
      return `${JSON.stringify(arr)}.includes(${access})`
    }
    default:
      return null
  }
}

export function optionsMapConstName(fieldName: string): string {
  return `OPTIONS_MAP_${fieldName}`
}

export function optionsFallbackConstName(fieldName: string): string {
  return `OPTIONS_FALLBACK_${fieldName}`
}

export function serializeOptionsMap(map: Record<string, string[]>): string {
  const entries = Object.entries(map).map(
    ([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`
  )
  if (entries.length === 0) return '{}'
  return `{\n${entries.join(',\n')},\n}`
}

export function defaultValueLiteral(field: Field): string {
  if (field.type === 'checkbox') return 'false'
  return "''"
}

export function tsTypeFor(field: Field): string {
  if (field.type === 'checkbox') return 'boolean'
  return 'string'
}
