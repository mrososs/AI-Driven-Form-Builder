import type { FormElement } from '../../stores/form'
import type { Framework, GeneratedComponent } from './shared.js'
import { generateVueComponent } from './vue.js'
import { generateReactComponent } from './react.js'
import { generateAngularComponent } from './angular.js'

export type { Framework, GeneratedComponent } from './shared.js'

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
