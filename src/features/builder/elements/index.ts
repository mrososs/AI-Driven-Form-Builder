import type { ElementCategory, ElementDefinition } from './types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from './types'
import { textElement } from './textElement'
import { textareaElement } from './textareaElement'
import { numberElement } from './numberElement'
import { emailElement } from './emailElement'
import { phoneElement } from './phoneElement'
import { urlElement } from './urlElement'
import { selectElement } from './selectElement'
import { radioElement } from './radioElement'
import { checkboxElement } from './checkboxElement'
import { dateElement } from './dateElement'
import { timeElement } from './timeElement'
import { datetimeElement } from './datetimeElement'
import { fileElement } from './fileElement'
import { rowElement } from './rowElement'

export const ELEMENTS: ElementDefinition[] = [
  textElement,
  textareaElement,
  numberElement,
  emailElement,
  phoneElement,
  urlElement,
  selectElement,
  radioElement,
  checkboxElement,
  dateElement,
  timeElement,
  datetimeElement,
  fileElement,
  rowElement,
]

const BY_TYPE: Record<string, ElementDefinition> = Object.fromEntries(
  ELEMENTS.map(el => [el.type, el])
)

export function getElementDefinition(type: string): ElementDefinition | undefined {
  return BY_TYPE[type]
}

export interface ElementGroup {
  key: ElementCategory
  label: string
  elements: ElementDefinition[]
}

export const ELEMENT_GROUPS: ElementGroup[] = CATEGORY_ORDER.map(key => ({
  key,
  label: CATEGORY_LABELS[key],
  elements: ELEMENTS.filter(el => el.category === key),
})).filter(group => group.elements.length > 0)

export type { ElementCategory, ElementDefinition } from './types'
