import { CheckSquare } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const checkboxElement: ElementDefinition = {
  type: 'checkbox',
  label: 'Checkbox',
  icon: CheckSquare,
  category: 'choice',
  createDefault: () => ({
    id: newId(),
    type: 'checkbox',
    label: 'New Checkbox',
    required: false,
  }),
}
