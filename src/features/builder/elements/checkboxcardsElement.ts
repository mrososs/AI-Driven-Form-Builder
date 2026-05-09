import { SquareStack } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const checkboxcardsElement: ElementDefinition = {
  type: 'checkboxcards',
  label: 'Checkbox Cards',
  icon: SquareStack,
  category: 'choice',
  createDefault: () => ({
    id: newId(),
    type: 'checkboxcards',
    label: 'Pick any',
    required: false,
    cards: [
      { value: 'option-1', title: 'Option 1' },
      { value: 'option-2', title: 'Option 2' },
    ],
  }),
}
