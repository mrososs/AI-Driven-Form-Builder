import { CalendarClock } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const datetimeElement: ElementDefinition = {
  type: 'datetime',
  label: 'Date & Time',
  icon: CalendarClock,
  category: 'datetime',
  createDefault: () => ({
    id: newId(),
    type: 'datetime',
    label: 'Select Date & Time',
    required: false,
  }),
}
