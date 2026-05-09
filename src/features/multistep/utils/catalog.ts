import {
  AlignLeft,
  Mail,
  Phone,
  Hash,
  KeyRound,
  Lock,
  List,
  CircleDot,
  CheckSquare,
  Calendar,
  CalendarRange,
  Upload,
  LayoutList,
  PlusSquare,
  LayoutGrid,
  SquareStack,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { MultiStepElementType } from '../../../stores/multistepForm'

export type CatalogGroupKey = 'basic' | 'choice' | 'time' | 'media' | 'layout'

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
  { type: 'password', label: 'Password', icon: Lock, group: 'basic' },
  { type: 'number', label: 'Number', icon: Hash, group: 'basic' },
  { type: 'otp', label: 'OTP Code', icon: KeyRound, group: 'basic' },
  { type: 'stepper', label: 'Stepper', icon: PlusSquare, group: 'basic' },
  { type: 'select', label: 'Dropdown', icon: List, group: 'choice' },
  { type: 'radio', label: 'Radio', icon: CircleDot, group: 'choice' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, group: 'choice' },
  { type: 'radiocards', label: 'Radio Cards', icon: LayoutGrid, group: 'choice' },
  { type: 'checkboxcards', label: 'Checkbox Cards', icon: SquareStack, group: 'choice' },
  { type: 'date', label: 'Date', icon: Calendar, group: 'time' },
  { type: 'daterange', label: 'Date Range', icon: CalendarRange, group: 'time' },
  { type: 'file', label: 'Upload', icon: Upload, group: 'media' },
  { type: 'row', label: 'Layout Row', icon: LayoutList, group: 'layout' },
]

export const CATALOG_GROUPS: Array<{ key: CatalogGroupKey; label: string }> = [
  { key: 'basic', label: 'Basic' },
  { key: 'choice', label: 'Choice' },
  { key: 'time', label: 'Time' },
  { key: 'media', label: 'Media' },
  { key: 'layout', label: 'Layout' },
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
    case 'password':
      return '••••••••'
    default:
      return 'User input…'
  }
}
