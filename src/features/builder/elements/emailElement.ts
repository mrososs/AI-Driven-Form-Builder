import { Mail } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const emailElement: ElementDefinition = {
  type: 'email',
  label: 'Email',
  icon: Mail,
  category: 'text',
  hasPlaceholder: true,
  createDefault: () => ({
    id: newId(),
    type: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: false,
  }),
}
