import { Lock } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const passwordElement: ElementDefinition = {
  type: 'password',
  label: 'Password',
  icon: Lock,
  category: 'text',
  hasPlaceholder: true,
  createDefault: () => ({
    id: newId(),
    type: 'password',
    label: 'Password',
    placeholder: 'Enter password...',
    required: false,
  }),
}
