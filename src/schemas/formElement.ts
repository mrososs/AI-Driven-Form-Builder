import { z } from 'zod'

const SINGLE_FORM_TYPES = [
  'text',
  'textarea',
  'number',
  'email',
  'phone',
  'url',
  'password',
  'select',
  'radio',
  'checkbox',
  'date',
  'time',
  'datetime',
  'daterange',
  'stepper',
  'radiocards',
  'checkboxcards',
] as const

const MULTI_STEP_TYPES = [
  'text',
  'textarea',
  'email',
  'phone',
  'password',
  'number',
  'otp',
  'select',
  'radio',
  'checkbox',
  'date',
  'file',
  'daterange',
  'stepper',
  'radiocards',
  'checkboxcards',
] as const

const STEP_ICONS = ['user', 'shield', 'building', 'credit', 'users', 'flag'] as const

const optionStringArray = z
  .array(z.string().trim().min(1).max(120))
  .min(1)
  .max(20)

const RANGE_UNITS = ['nights', 'days', 'hours', 'weeks'] as const

const cardSchema = z.object({
  value: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(240).optional(),
  meta: z.string().trim().max(80).optional(),
})

const cardArray = z.array(cardSchema).min(1).max(20)

const baseElementShape = {
  id: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(200),
  placeholder: z.string().trim().max(200).optional(),
  required: z.boolean(),
  options: optionStringArray.optional(),
  rangeUnit: z.enum(RANGE_UNITS).optional(),
  min: z.number().finite().optional(),
  max: z.number().finite().optional(),
  step: z.number().finite().positive().optional(),
  defaultValue: z.number().finite().optional(),
  cards: cardArray.optional(),
}

function checkSpecificRequirements(
  el: { type: string; options?: string[]; cards?: unknown[]; min?: number; max?: number },
  ctx: z.RefinementCtx,
) {
  if ((el.type === 'select' || el.type === 'radio') && (!el.options || el.options.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Element of type "${el.type}" requires options.`,
      path: ['options'],
    })
  }
  if (
    (el.type === 'radiocards' || el.type === 'checkboxcards') &&
    (!el.cards || el.cards.length === 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Element of type "${el.type}" requires at least one card.`,
      path: ['cards'],
    })
  }
  if (el.type === 'stepper' && el.min !== undefined && el.max !== undefined && el.max < el.min) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Stepper "max" must be greater than or equal to "min".',
      path: ['max'],
    })
  }
}

export const generatedFormElementSchema = z
  .object({
    ...baseElementShape,
    type: z.enum(SINGLE_FORM_TYPES),
  })
  .superRefine(checkSpecificRequirements)

export const formMetaSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(280),
})

export const generatedMultiStepElementSchema = z
  .object({
    ...baseElementShape,
    type: z.enum(MULTI_STEP_TYPES),
  })
  .superRefine(checkSpecificRequirements)

export const generatedFormStepSchema = z.object({
  id: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(120),
  icon: z.enum(STEP_ICONS),
  description: z.string().trim().max(200).default(''),
  elements: z.array(generatedMultiStepElementSchema).max(20),
})

export const formNameSchema = z.object({
  name: z.string().trim().min(1).max(120),
})

export type GeneratedFormElement = z.infer<typeof generatedFormElementSchema>
export type GeneratedFormMeta = z.infer<typeof formMetaSchema>
export type GeneratedFormStep = z.infer<typeof generatedFormStepSchema>
export type GeneratedFormName = z.infer<typeof formNameSchema>
