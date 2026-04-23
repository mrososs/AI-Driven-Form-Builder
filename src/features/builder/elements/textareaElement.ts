import { AlignLeft } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const textareaElement: ElementDefinition = {
  type: 'textarea',
  label: 'Long Text',
  icon: AlignLeft,
  category: 'text',
  hasPlaceholder: true,
  createDefault: () => ({
    id: newId(),
    type: 'textarea',
    label: 'New Long Text',
    placeholder: 'Enter text...',
    required: false,
  }),
}
