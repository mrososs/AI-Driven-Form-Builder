import { Calendar } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const dateElement: ElementDefinition = {
  type: 'date',
  label: 'Date',
  icon: Calendar,
  category: 'datetime',
  createDefault: () => ({
    id: newId(),
    type: 'date',
    label: 'Select a Date',
    required: false,
  }),
}
