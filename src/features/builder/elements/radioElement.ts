import { CircleDot } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const radioElement: ElementDefinition = {
  type: 'radio',
  label: 'Multiple Choice',
  icon: CircleDot,
  category: 'choice',
  hasOptions: true,
  createDefault: () => ({
    id: newId(),
    type: 'radio',
    label: 'New Multiple Choice',
    required: false,
    options: ['Option 1', 'Option 2'],
  }),
}
