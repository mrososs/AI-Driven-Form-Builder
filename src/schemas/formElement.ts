import { z } from 'zod'

const SINGLE_FORM_TYPES = [
  'text',
  'textarea',
  'number',
  'email',
  'phone',
  'url',
  'select',
  'radio',
  'checkbox',
  'date',
  'time',
  'datetime',
] as const

const MULTI_STEP_TYPES = [
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'otp',
  'select',
  'radio',
  'checkbox',
  'date',
  'file',
] as const

const STEP_ICONS = ['user', 'shield', 'building', 'credit', 'users', 'flag'] as const

const optionStringArray = z
  .array(z.string().trim().min(1).max(120))
  .min(1)
  .max(20)

export const generatedFormElementSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    type: z.enum(SINGLE_FORM_TYPES),
    label: z.string().trim().min(1).max(200),
    placeholder: z.string().trim().max(200).optional(),
    required: z.boolean(),
    options: optionStringArray.optional(),
  })
  .superRefine((el, ctx) => {
    if ((el.type === 'select' || el.type === 'radio') && (!el.options || el.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Element of type "${el.type}" requires options.`,
        path: ['options'],
      })
    }
  })

export const formMetaSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(280),
})

export const generatedMultiStepElementSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    type: z.enum(MULTI_STEP_TYPES),
    label: z.string().trim().min(1).max(200),
    placeholder: z.string().trim().max(200).optional(),
    required: z.boolean(),
    options: optionStringArray.optional(),
  })
  .superRefine((el, ctx) => {
    if ((el.type === 'select' || el.type === 'radio') && (!el.options || el.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Element of type "${el.type}" requires options.`,
        path: ['options'],
      })
    }
  })

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
