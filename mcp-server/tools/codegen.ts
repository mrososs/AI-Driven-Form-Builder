import { generateComponent } from '../../src/utils/codegen/index.js'
import type { FormElement, Framework } from '../types.js'

export interface CodegenInput {
  elements: FormElement[]
  title: string
  framework: Framework
}

export interface CodegenResult {
  code: string
  filename: string
  language: string
}

export function generateCode(input: CodegenInput): CodegenResult {
  const { elements, title, framework } = input
  const result = generateComponent(elements as Parameters<typeof generateComponent>[0], title, framework)
  return {
    code: result.code,
    filename: result.filename,
    language: result.language,
  }
}
