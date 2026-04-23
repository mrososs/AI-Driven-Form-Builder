import { Link } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const urlElement: ElementDefinition = {
  type: 'url',
  label: 'Website',
  icon: Link,
  category: 'text',
  hasPlaceholder: true,
  createDefault: () => ({
    id: newId(),
    type: 'url',
    label: 'Website',
    placeholder: 'https://example.com',
    required: false,
  }),
}
