import { LayoutList } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const rowElement: ElementDefinition = {
  type: 'row',
  label: 'Layout Row',
  icon: LayoutList,
  category: 'layout',
  createDefault: () => ({
    id: newId(),
    type: 'row',
    label: 'New Row',
    required: false,
    children: [],
  }),
}
