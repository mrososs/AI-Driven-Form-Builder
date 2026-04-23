import { Hash } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const numberElement: ElementDefinition = {
  type: 'number',
  label: 'Number',
  icon: Hash,
  category: 'text',
  hasPlaceholder: true,
  createDefault: () => ({
    id: newId(),
    type: 'number',
    label: 'New Number',
    placeholder: '0',
    required: false,
  }),
}
