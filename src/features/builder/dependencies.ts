import type { FormElement, VisibilityRule } from '../../stores/form'

export type PreviewValueMap = Record<string, unknown>

function normalize(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

function isEmptyValue(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.length === 0
  if (typeof value === 'boolean') return value === false
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function evaluateRule(rule: VisibilityRule, values: PreviewValueMap): boolean {
  const raw = values[rule.sourceId]
  switch (rule.operator) {
    case 'empty':
      return isEmptyValue(raw)
    case 'notEmpty':
      return !isEmptyValue(raw)
    case 'equals':
      return normalize(raw) === normalize(rule.value ?? '')
    case 'notEquals':
      return normalize(raw) !== normalize(rule.value ?? '')
    case 'in': {
      const list = Array.isArray(rule.value) ? rule.value : []
      return list.map(normalize).includes(normalize(raw))
    }
    default:
      return true
  }
}

export function isVisible(el: FormElement, values: PreviewValueMap): boolean {
  if (!el.visibility) return true
  return evaluateRule(el.visibility, values)
}

export function resolveOptions(el: FormElement, values: PreviewValueMap): string[] {
  if (!el.optionsSource) return el.options ?? []
  const parentValue = normalize(values[el.optionsSource.sourceId])
  const mapped = el.optionsSource.map[parentValue]
  if (mapped && mapped.length > 0) return mapped
  return el.optionsSource.fallback ?? []
}

export function describeOperator(op: VisibilityRule['operator']): string {
  switch (op) {
    case 'equals': return 'equals'
    case 'notEquals': return 'does not equal'
    case 'in': return 'is one of'
    case 'empty': return 'is empty'
    case 'notEmpty': return 'is not empty'
    default: return op
  }
}
