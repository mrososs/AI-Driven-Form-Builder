import { Clock } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const timeElement: ElementDefinition = {
  type: 'time',
  label: 'Time',
  icon: Clock,
  category: 'datetime',
  createDefault: () => ({
    id: newId(),
    type: 'time',
    label: 'Select a Time',
    required: false,
  }),
}
