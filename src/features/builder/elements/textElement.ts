import { Type } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const textElement: ElementDefinition = {
  type: 'text',
  label: 'Short Text',
  icon: Type,
  category: 'text',
  hasPlaceholder: true,
  createDefault: () => ({
    id: newId(),
    type: 'text',
    label: 'New Short Text',
    placeholder: 'Enter text...',
    required: false,
  }),
}
