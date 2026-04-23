import { ChevronDown } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const selectElement: ElementDefinition = {
  type: 'select',
  label: 'Dropdown',
  icon: ChevronDown,
  category: 'choice',
  hasOptions: true,
  createDefault: () => ({
    id: newId(),
    type: 'select',
    label: 'New Dropdown',
    required: false,
    options: ['Option 1'],
  }),
}
