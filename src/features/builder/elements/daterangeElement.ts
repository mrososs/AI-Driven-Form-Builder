import { CalendarRange } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const daterangeElement: ElementDefinition = {
  type: 'daterange',
  label: 'Date Range',
  icon: CalendarRange,
  category: 'datetime',
  createDefault: () => ({
    id: newId(),
    type: 'daterange',
    label: 'Date range',
    required: false,
    rangeUnit: 'days',
  }),
}
