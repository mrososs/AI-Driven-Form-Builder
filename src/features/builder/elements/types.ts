import type { Component } from 'vue'
import type { FormElement } from '../../../stores/form'

export type ElementCategory = 'text' | 'choice' | 'datetime' | 'upload' | 'layout'

export interface ElementDefinition {
  type: string
  label: string
  icon: Component
  category: ElementCategory
  hasPlaceholder?: boolean
  hasOptions?: boolean
  createDefault: () => FormElement
}

export const CATEGORY_ORDER: ElementCategory[] = [
  'text',
  'choice',
  'datetime',
  'upload',
  'layout',
]

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  text: 'Text Fields',
  choice: 'Choice Fields',
  datetime: 'Date & Time',
  upload: 'Upload',
  layout: 'Layout',
}
