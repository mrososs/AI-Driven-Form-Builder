import { LayoutGrid } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const radiocardsElement: ElementDefinition = {
  type: 'radiocards',
  label: 'Radio Cards',
  icon: LayoutGrid,
  category: 'choice',
  createDefault: () => ({
    id: newId(),
    type: 'radiocards',
    label: 'Pick one',
    required: false,
    cards: [
      { value: 'option-1', title: 'Option 1' },
      { value: 'option-2', title: 'Option 2' },
    ],
  }),
}
