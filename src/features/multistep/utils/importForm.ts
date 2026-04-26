import type { FormElement, SavedForm } from '../../../stores/form'
import {
  newId,
  type FormStep,
  type MultiStepElement,
  type MultiStepElementType,
} from '../../../stores/multistepForm'

export interface ConversionSummary {
  converted: Partial<Record<string, number>>
  droppedVisibility: number
  droppedOptionsSource: number
}

const IDENTITY_TYPES = new Set<MultiStepElementType>([
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'select',
  'radio',
  'checkbox',
  'date',
  'file',
])

function placeholderForCoerced(originalType: string, current?: string): string {
  if (current) return current
  if (originalType === 'time') return 'HH:MM'
  if (originalType === 'datetime') return 'YYYY-MM-DD HH:MM'
  return ''
}

function mapElement(
  el: FormElement,
  summary: ConversionSummary
): MultiStepElement | null {
  if (el.type === 'row') return null

  if (el.visibility) summary.droppedVisibility++
  if (el.optionsSource) summary.droppedOptionsSource++

  let targetType: MultiStepElementType
  let placeholder = el.placeholder

  if (IDENTITY_TYPES.has(el.type as MultiStepElementType)) {
    targetType = el.type as MultiStepElementType
  } else if (el.type === 'url' || el.type === 'time' || el.type === 'datetime') {
    targetType = 'text'
    placeholder = placeholderForCoerced(el.type, el.placeholder)
    summary.converted[el.type] = (summary.converted[el.type] ?? 0) + 1
  } else {
    return null
  }

  const out: MultiStepElement = {
    id: newId(),
    type: targetType,
    label: el.label,
    placeholder,
    required: el.required,
  }

  if ((targetType === 'select' || targetType === 'radio') && el.options) {
    out.options = [...el.options]
  }

  return out
}

function flattenElements(
  elements: FormElement[],
  summary: ConversionSummary
): MultiStepElement[] {
  const out: MultiStepElement[] = []
  for (const el of elements) {
    if (el.type === 'row') {
      summary.converted.row = (summary.converted.row ?? 0) + 1
      if (el.children?.length) {
        out.push(...flattenElements(el.children, summary))
      }
      continue
    }
    const mapped = mapElement(el, summary)
    if (mapped) out.push(mapped)
  }
  return out
}

export function convertSavedFormToStep(form: SavedForm): {
  step: FormStep
  summary: ConversionSummary
} {
  const summary: ConversionSummary = {
    converted: {},
    droppedVisibility: 0,
    droppedOptionsSource: 0,
  }
  const elements = flattenElements(form.elements ?? [], summary)
  const step: FormStep = {
    id: newId(),
    title: form.title?.trim() || 'Imported step',
    icon: 'user',
    description: form.description ?? '',
    elements,
  }
  return { step, summary }
}
