import type { FormElement } from '../../stores/form'
import type { Framework, GeneratedComponent } from './shared'
import { generateVueComponent } from './vue'
import { generateReactComponent } from './react'
import { generateAngularComponent } from './angular'

export type { Framework, GeneratedComponent } from './shared'

export function generateComponent(
  elements: FormElement[],
  title: string,
  framework: Framework
): GeneratedComponent {
  switch (framework) {
    case 'vue':
      return generateVueComponent(elements, title)
    case 'react':
      return generateReactComponent(elements, title)
    case 'angular':
      return generateAngularComponent(elements, title)
  }
}
