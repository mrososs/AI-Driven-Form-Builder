import { Upload } from 'lucide-vue-next'
import type { ElementDefinition } from './types'
import { newId } from './utils'

export const fileElement: ElementDefinition = {
  type: 'file',
  label: 'File Upload',
  icon: Upload,
  category: 'upload',
  createDefault: () => ({
    id: newId(),
    type: 'file',
    label: 'Upload a File',
    required: false,
  }),
}
