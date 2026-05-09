import { PlusSquare } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const stepperElement: ElementDefinition = {
  type: 'stepper',
  label: 'Stepper',
  icon: PlusSquare,
  category: 'text',
  createDefault: () => ({
    id: newId(),
    type: 'stepper',
    label: 'Quantity',
    required: false,
    min: 0,
    max: 99,
    step: 1,
    defaultValue: 0,
  }),
}
