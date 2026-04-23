import { Phone } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const phoneElement: ElementDefinition = {
  type: 'phone',
  label: 'Phone',
  icon: Phone,
  category: 'text',
  hasPlaceholder: true,
  createDefault: () => ({
    id: newId(),
    type: 'phone',
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    required: false,
  }),
}
