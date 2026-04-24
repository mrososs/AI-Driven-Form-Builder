import type { FormElement } from '../stores/form'
import type { Framework } from './codegen/shared'

export function generateFrameworkPrompt(framework: Framework): string {
  const frameworkDetails: Record<Framework, string> = {
    vue: `## Vue 3 + TypeScript + Pinia
- Use Vue 3 composition API with \`<script setup>\`
- TypeScript for full type safety
- Pinia for state management (if form state is needed)
- Tailwind CSS v4 for styling
- Lucide Vue Next (lucide-vue-next) for icons
- Structure: SFC (Single File Component) with inline styles or Tailwind classes`,
    react: `## React 18 + TypeScript + Context
- Use React functional components with hooks
- TypeScript for full type safety
- React Context or Zustand for state management (if needed)
- Tailwind CSS v4 for styling
- Lucide React (lucide-react) for icons
- Use \`use client\` if in Next.js app directory`,
    angular: `## Angular 17+ + TypeScript
- Use standalone components with latest Angular syntax
- TypeScript with strict mode enabled
- Reactive Forms (FormBuilder) for form handling
- Tailwind CSS v4 for styling
- ng-lucide for icons
- OnInit lifecycle for initialization`,
  }
  return frameworkDetails[framework]
}

export function generateDesignSystemConstraints(): string {
  return `## Design System Constraints
- **Theme:** Dark glassmorphic base with indigo/purple accents
  - Background: #0a0a0f or dark slate
  - Primary accent: Indigo (#4f46e5) with purple gradient
  - Secondary: Slate-200/dark, white/opacity variations
- **Fonts:**
  - Headings: Bricolage Grotesque (font-heading)
  - Body: Plus Jakarta Sans (font-body)
  - Monospace: JetBrains Mono (for code/technical content)
- **Icons:** Lucide icons exclusively (no other icon libraries)
- **Animations:**
  - Smooth, exponential easing (cubic-bezier based)
  - No bouncy or elastic animations
  - Respect prefers-reduced-motion
- **Accessibility:**
  - WCAG AA target
  - Semantic HTML structure
  - Keyboard navigation support
  - ARIA labels where needed
- **RTL Support:**
  - Use dir="ltr" or dir="rtl" on root elements
  - Flexbox direction respects RTL
  - Proper text alignment in RTL contexts`
}

function describeField(element: FormElement): string {
  const requiredLabel = element.required ? '[required]' : '[optional]'
  let description = `- ${element.label} (${element.type}) ${requiredLabel}`

  if (element.placeholder) {
    description += ` - placeholder: "${element.placeholder}"`
  }

  if (element.options && element.options.length > 0) {
    description += ` - options: [${element.options.map(o => `"${o}"`).join(', ')}]`
  }

  return description
}

function describeFieldsRecursive(elements: FormElement[], indent = 0): string {
  const prefix = '  '.repeat(indent)
  return elements
    .map(el => {
      if (el.type === 'row') {
        const childrenDesc = describeFieldsRecursive(el.children ?? [], indent + 1)
        return `${prefix}- Layout Row:\n${childrenDesc}`
      }
      return prefix + describeField(el)
    })
    .join('\n')
}

function buildFormStructureJSON(elements: FormElement[]): object {
  return {
    form: {
      type: 'form',
      children: elements,
    },
  }
}

export function generateFrameworkAwarePrompt(
  elements: FormElement[],
  title: string,
  description: string,
  framework: Framework,
  language: string
): string {
  const isRTL = language === 'ar'
  const dirAttribute = isRTL ? 'rtl' : 'ltr'
  const hasFields = elements.length > 0

  const fieldDescriptions = hasFields
    ? `### Form Fields
${describeFieldsRecursive(elements)}`
    : '### Form Fields\nNo fields configured yet.'

  const formJSON = buildFormStructureJSON(elements)

  const prompt = `# AI Form Component Generation Prompt

## ROLE
You are an expert ${framework === 'vue' ? 'Vue.js' : framework === 'react' ? 'React' : 'Angular'} developer specializing in building accessible, type-safe form components using modern web standards and Tailwind CSS.

## INPUT
- **Form Title:** ${title || 'Untitled Form'}
- **Form Description:** ${description || 'A brief description of your form'}
- **Language:** ${language === 'ar' ? 'Arabic' : 'English'}
- **Text Direction:** ${dirAttribute.toUpperCase()} (${isRTL ? 'Right-to-Left' : 'Left-to-Right'})
- **Target Framework:** ${framework === 'vue' ? 'Vue 3' : framework === 'react' ? 'React 18+' : 'Angular 17+'}

${generateDesignSystemConstraints()}

${generateFrameworkPrompt(framework)}

${fieldDescriptions}

### Form Structure (JSON)
\`\`\`json
${JSON.stringify(formJSON, null, 2)}
\`\`\`

## INSTRUCTIONS
Create a complete, production-ready ${framework === 'vue' ? 'Vue' : framework === 'react' ? 'React' : 'Angular'} form component that reproduces this form exactly with:

1. **Field Types & Validation:**
   - Support all specified field types with appropriate HTML input types
   - Implement required field validation
   - Apply client-side validation rules

2. **Form Structure:**
   - Maintain exact field order and grouping
   - Preserve layout rows and nested structure
   - Use semantic form elements (\`<form>\`, \`<label>\`, \`<input>\`, etc.)

3. **Styling & Design:**
   - Apply the design system constraints above
   - Use Tailwind CSS v4 exclusively for styling
   - Ensure responsive design (mobile-first approach)
   - Implement smooth transitions and proper hover states

4. **Accessibility:**
   - Use proper \`<label>\` elements with \`for\` attributes
   - Include ARIA labels where needed
   - Ensure keyboard navigation works
   - Support semantic HTML structure
   - Include \`aria-required="true"\` for required fields

5. **Internationalization & RTL:**
   - Apply dir="${dirAttribute}" to root container
   - Ensure proper ${isRTL ? 'RTL' : 'LTR'} layout behavior
   - Flexbox and grid directions respect text direction
   - All text alignment respects ${isRTL ? 'RTL' : 'LTR'} context

6. **Type Safety:**
   - Use TypeScript with proper type definitions
   - Define form data interfaces
   - Use proper type annotations throughout

7. **Icons & Visual Elements:**
   - Use Lucide icons for any visual indicators
   - Use appropriate icons for success, error, warning states
   - Maintain consistent icon sizing and styling

8. **Form State:**
   - Initialize with empty form fields
   - Implement proper state management for form values
   - Support form submission handling (basic structure)

## OUTPUT
Provide a complete, working component code that can be directly integrated into the project.`

  return prompt
}
