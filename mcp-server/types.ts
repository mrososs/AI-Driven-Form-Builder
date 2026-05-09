export type DependencyOperator = 'equals' | 'notEquals' | 'in' | 'empty' | 'notEmpty'

export interface VisibilityRule {
  sourceId: string
  operator: DependencyOperator
  value?: string | string[]
}

export interface OptionsMap {
  sourceId: string
  map: Record<string, string[]>
  fallback?: string[]
}

export type RangeUnit = 'nights' | 'days' | 'hours' | 'weeks'

export interface CardItem {
  value: string
  title: string
  description?: string
  meta?: string
}

export interface FormElement {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  children?: FormElement[]
  visibility?: VisibilityRule
  optionsSource?: OptionsMap
  rangeUnit?: RangeUnit
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  cards?: CardItem[]
}

export interface MultiStepElement {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  rangeUnit?: RangeUnit
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  cards?: CardItem[]
  children?: MultiStepElement[]
}

export interface StepBehavior {
  requireAll?: boolean
  allowSkip?: boolean
  sendVerificationOnEnter?: boolean
  autoSaveOnExit?: boolean
}

export interface FormStep {
  id: string
  title: string
  icon: 'user' | 'shield' | 'building' | 'credit' | 'users' | 'flag'
  description: string
  elements: MultiStepElement[]
  behavior?: StepBehavior
}

export interface SingleFormResult {
  type: 'single'
  title: string
  description: string
  elements: FormElement[]
  remaining: number
}

export interface MultiStepFormResult {
  type: 'multistep'
  name: string
  steps: FormStep[]
  remaining: number
}

export type GenerateFormResult = SingleFormResult | MultiStepFormResult

export type Framework = 'vue' | 'react' | 'angular'
