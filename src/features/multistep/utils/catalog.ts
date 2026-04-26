import {
  AlignLeft,
  Mail,
  Phone,
  Hash,
  KeyRound,
  List,
  CircleDot,
  CheckSquare,
  Calendar,
  Upload,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { MultiStepElementType } from '../../../stores/multistepForm'

export type CatalogGroupKey = 'basic' | 'choice' | 'time' | 'media'

export interface CatalogEntry {
  type: MultiStepElementType
  label: string
  icon: Component
  group: CatalogGroupKey
}

export const CATALOG: CatalogEntry[] = [
  { type: 'text', label: 'Short Text', icon: AlignLeft, group: 'basic' },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft, group: 'basic' },
  { type: 'email', label: 'Email', icon: Mail, group: 'basic' },
  { type: 'phone', label: 'Phone', icon: Phone, group: 'basic' },
  { type: 'number', label: 'Number', icon: Hash, group: 'basic' },
  { type: 'otp', label: 'OTP Code', icon: KeyRound, group: 'basic' },
  { type: 'select', label: 'Dropdown', icon: List, group: 'choice' },
  { type: 'radio', label: 'Radio', icon: CircleDot, group: 'choice' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, group: 'choice' },
  { type: 'date', label: 'Date', icon: Calendar, group: 'time' },
  { type: 'file', label: 'Upload', icon: Upload, group: 'media' },
]

export const CATALOG_GROUPS: Array<{ key: CatalogGroupKey; label: string }> = [
  { key: 'basic', label: 'Basic' },
  { key: 'choice', label: 'Choice' },
  { key: 'time', label: 'Time' },
  { key: 'media', label: 'Media' },
]

export function getCatalogEntry(type: MultiStepElementType): CatalogEntry | undefined {
  return CATALOG.find(entry => entry.type === type)
}

export function placeholderFor(type: MultiStepElementType): string {
  switch (type) {
    case 'email':
      return 'you@example.com'
    case 'phone':
      return '+1 (555) 123-4567'
    case 'number':
      return '0'
    default:
      return 'User input…'
  }
}
