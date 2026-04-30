import { ref, shallowRef, computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '../firebase'
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { useAuthStore } from './auth'
import type { StepIconKey } from '../features/multistep/utils/icons'
import type { SavedForm } from './form'
import {
  convertSavedFormToStep,
  type ConversionSummary,
} from '../features/multistep/utils/importForm'

export type MultiStepElementType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'otp'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'

export interface MultiStepElement {
  id: string
  type: MultiStepElementType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export interface FormStep {
  id: string
  title: string
  icon: StepIconKey
  description: string
  elements: MultiStepElement[]
}

export type ProgressStyle = 'numbered' | 'bar' | 'dots' | 'sidebar'

export interface FlowSettings {
  linear: boolean
  requireAll: boolean
}

export type RuleKind = 'branch' | 'skip' | 'require' | 'async'
export type RuleOperator =
  | 'equals'
  | 'notEquals'
  | 'in'
  | 'gt'
  | 'lt'
  | 'empty'
  | 'notEmpty'
  | 'isVerified'
  | 'asyncCheck'
export type RuleAction = 'jumpTo' | 'skipStep' | 'gate' | 'validate'

export interface SavedMultiStepForm {
  id: string
  name: string
  steps: FormStep[]
  progressStyle: ProgressStyle
  flow: FlowSettings
  rules: LogicRule[]
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface LogicRule {
  id: string
  kind: RuleKind
  enabled: boolean
  if: {
    stepId: string
    fieldLabel: string
    op: RuleOperator
    value: string
  }
  then: {
    action: RuleAction
    targetStepId?: string
    note?: string
  }
}

const STORAGE_KEY = 'multistep-form-draft'

export const newId = () => Math.random().toString(36).slice(2, 11)

export interface MultiStepTemplate {
  id: string
  name: string
  description: string
  build: () => { steps: FormStep[]; rules: LogicRule[] }
}

function tenantRegistrationSteps(): FormStep[] {
  return [
    {
      id: newId(),
      title: 'Account details',
      icon: 'user',
      description: 'Who is registering?',
      elements: [
        { id: newId(), type: 'text', label: 'Full name', placeholder: 'Jane Doe', required: true },
        { id: newId(), type: 'email', label: 'Work email', placeholder: 'jane@acme.com', required: true },
      ],
    },
    {
      id: newId(),
      title: 'Verify email',
      icon: 'shield',
      description: 'A 6-digit code was sent to the email above.',
      elements: [
        { id: newId(), type: 'otp', label: 'One-time code', placeholder: '••••••', required: true },
      ],
    },
    {
      id: newId(),
      title: 'Company details',
      icon: 'building',
      description: 'Tell us about your organization.',
      elements: [
        { id: newId(), type: 'text', label: 'Company name', placeholder: 'Acme Inc.', required: true },
        {
          id: newId(),
          type: 'select',
          label: 'Company size',
          required: true,
          options: ['1–10', '11–50', '51–200', '201+'],
        },
        { id: newId(), type: 'text', label: 'Subdomain', placeholder: 'acme.formai.app', required: true },
      ],
    },
    {
      id: newId(),
      title: 'Plan & billing',
      icon: 'credit',
      description: 'Pick a plan — billing is paused for 14 days.',
      elements: [
        {
          id: newId(),
          type: 'radio',
          label: 'Plan',
          required: true,
          options: ['Starter — $29/mo', 'Team — $99/mo', 'Enterprise — Contact us'],
        },
      ],
    },
    {
      id: newId(),
      title: 'Invite team',
      icon: 'users',
      description: 'Optional — you can invite later from settings.',
      elements: [
        {
          id: newId(),
          type: 'textarea',
          label: 'Emails (comma-separated)',
          placeholder: 'alex@acme.com, sam@acme.com',
          required: false,
        },
      ],
    },
    {
      id: newId(),
      title: 'Finish',
      icon: 'flag',
      description: 'Review and confirm. Welcome aboard.',
      elements: [
        { id: newId(), type: 'checkbox', label: 'I agree to the Terms of Service', required: true },
      ],
    },
  ]
}

export const TEMPLATES: MultiStepTemplate[] = [
  {
    id: 'tenant-registration',
    name: 'Tenant Registration',
    description:
      'Account → Verify email → Company → Plan → Invite team → Finish, with sample branch and gate rules.',
    build: () => {
      const steps = tenantRegistrationSteps()
      return { steps, rules: defaultTenantRules(steps) }
    },
  },
]

interface PersistedDraft {
  steps: FormStep[]
  progressStyle: ProgressStyle
  flow: FlowSettings
  rules?: LogicRule[]
  name?: string
  currentFormId?: string
}

function loadDraft(): PersistedDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedDraft) : null
  } catch {
    return null
  }
}

function defaultTenantRules(steps: FormStep[]): LogicRule[] {
  if (steps.length < 5) return []
  return [
    {
      id: newId(),
      kind: 'branch',
      enabled: true,
      if: { stepId: steps[2].id, fieldLabel: 'Company size', op: 'equals', value: '201+' },
      then: { action: 'jumpTo', targetStepId: steps[3].id },
    },
    {
      id: newId(),
      kind: 'skip',
      enabled: true,
      if: {
        stepId: steps[3].id,
        fieldLabel: 'Plan',
        op: 'equals',
        value: 'Enterprise — Contact us',
      },
      then: { action: 'skipStep', targetStepId: steps[4].id },
    },
    {
      id: newId(),
      kind: 'require',
      enabled: true,
      if: { stepId: steps[1].id, fieldLabel: 'One-time code', op: 'isVerified', value: '' },
      then: { action: 'gate', note: 'Must be verified before Company details' },
    },
    {
      id: newId(),
      kind: 'async',
      enabled: false,
      if: {
        stepId: steps[2].id,
        fieldLabel: 'Subdomain',
        op: 'asyncCheck',
        value: '/api/tenant/subdomain-available',
      },
      then: { action: 'validate', note: 'Unique subdomain required' },
    },
  ]
}

export const useMultiStepFormStore = defineStore('multistepForm', () => {
  const persisted = loadDraft()
  const initialSteps = persisted?.steps ?? []

  const steps = ref<FormStep[]>(initialSteps)
  const activeStepId = shallowRef<string | null>(initialSteps[0]?.id ?? null)
  const selectedElementId = shallowRef<string | null>(null)
  const progressStyle = shallowRef<ProgressStyle>(persisted?.progressStyle ?? 'numbered')
  const flow = ref<FlowSettings>(persisted?.flow ?? { linear: true, requireAll: true })
  const rules = ref<LogicRule[]>(persisted?.rules ?? [])
  const currentFormId = shallowRef<string | null>(persisted?.currentFormId ?? null)
  const formName = shallowRef<string>(persisted?.name ?? '')
  const isSaving = shallowRef(false)
  const isLoading = shallowRef(false)
  const savedForms = ref<SavedMultiStepForm[]>([])

  const activeStep = computed(() => steps.value.find(s => s.id === activeStepId.value) ?? null)
  const activeStepIndex = computed(() =>
    steps.value.findIndex(s => s.id === activeStepId.value)
  )
  const selectedElement = computed(() => {
    if (!activeStep.value || !selectedElementId.value) return null
    return activeStep.value.elements.find(e => e.id === selectedElementId.value) ?? null
  })
  const totalFields = computed(() =>
    steps.value.reduce((sum, s) => sum + s.elements.length, 0)
  )

  function selectStep(id: string | null) {
    activeStepId.value = id
    selectedElementId.value = null
  }

  function selectElement(id: string | null) {
    selectedElementId.value = id
  }

  function addStep(afterIndex: number | null = null) {
    const next: FormStep = {
      id: newId(),
      title: `New step ${steps.value.length + 1}`,
      icon: 'user',
      description: '',
      elements: [],
    }
    if (afterIndex == null) {
      steps.value.push(next)
    } else {
      steps.value.splice(afterIndex + 1, 0, next)
    }
    activeStepId.value = next.id
  }

  function removeStep(id: string) {
    if (steps.value.length <= 1) return
    const idx = steps.value.findIndex(s => s.id === id)
    steps.value = steps.value.filter(s => s.id !== id)
    if (activeStepId.value === id) {
      const fallback = steps.value[Math.max(0, idx - 1)]?.id ?? steps.value[0]?.id ?? null
      activeStepId.value = fallback
    }
    rules.value = rules.value.filter(
      r => r.if.stepId !== id && r.then.targetStepId !== id
    )
  }

  function duplicateStep(id: string) {
    const idx = steps.value.findIndex(s => s.id === id)
    if (idx < 0) return
    const src = steps.value[idx]
    const copy: FormStep = {
      ...src,
      id: newId(),
      title: `${src.title} copy`,
      elements: src.elements.map(e => ({ ...e, id: newId() })),
    }
    steps.value.splice(idx + 1, 0, copy)
  }

  function moveStep(id: string, dir: -1 | 1) {
    const i = steps.value.findIndex(s => s.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= steps.value.length) return
    const arr = steps.value.slice()
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    steps.value = arr
  }

  function updateStep(id: string, patch: Partial<FormStep>) {
    const step = steps.value.find(s => s.id === id)
    if (step) Object.assign(step, patch)
  }

  function addElement(type: MultiStepElementType, defaultLabel: string) {
    if (!activeStep.value) return
    const el: MultiStepElement = {
      id: newId(),
      type,
      label: defaultLabel,
      placeholder: '',
      required: false,
    }
    if (type === 'select' || type === 'radio') {
      el.options = ['Option 1', 'Option 2']
    }
    activeStep.value.elements.push(el)
    selectedElementId.value = el.id
  }

  function updateElement(id: string, patch: Partial<MultiStepElement>) {
    if (!activeStep.value) return
    const el = activeStep.value.elements.find(e => e.id === id)
    if (el) Object.assign(el, patch)
  }

  function removeElement(id: string) {
    if (!activeStep.value) return
    activeStep.value.elements = activeStep.value.elements.filter(e => e.id !== id)
    if (selectedElementId.value === id) selectedElementId.value = null
  }

  function setProgressStyle(style: ProgressStyle) {
    progressStyle.value = style
  }

  function setFlow(patch: Partial<FlowSettings>) {
    flow.value = { ...flow.value, ...patch }
  }

  function addRule(kind: RuleKind) {
    if (!steps.value.length) return
    const r: LogicRule = {
      id: newId(),
      kind,
      enabled: true,
      if: { stepId: steps.value[0].id, fieldLabel: '', op: 'equals', value: '' },
      then: {
        action:
          kind === 'branch'
            ? 'jumpTo'
            : kind === 'skip'
              ? 'skipStep'
              : kind === 'require'
                ? 'gate'
                : 'validate',
        targetStepId: steps.value[0].id,
        note: '',
      },
    }
    rules.value.push(r)
  }

  function updateRule(id: string, patch: Partial<LogicRule>) {
    const idx = rules.value.findIndex(r => r.id === id)
    if (idx < 0) return
    const current = rules.value[idx]
    rules.value[idx] = {
      ...current,
      ...patch,
      if: { ...current.if, ...(patch.if ?? {}) },
      then: { ...current.then, ...(patch.then ?? {}) },
    }
  }

  function removeRule(id: string) {
    rules.value = rules.value.filter(r => r.id !== id)
  }

  function saveDraft() {
    const payload: PersistedDraft = {
      steps: steps.value,
      progressStyle: progressStyle.value,
      flow: flow.value,
      rules: rules.value,
      name: formName.value,
      currentFormId: currentFormId.value ?? undefined,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore quota errors
    }
  }

  function resetDraft() {
    steps.value = []
    activeStepId.value = null
    selectedElementId.value = null
    progressStyle.value = 'numbered'
    flow.value = { linear: true, requireAll: true }
    rules.value = []
    currentFormId.value = null
    formName.value = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  async function saveToFirestore(name: string): Promise<void> {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('Not authenticated')
    isSaving.value = true
    try {
      const payload = {
        name,
        steps: steps.value,
        progressStyle: progressStyle.value,
        flow: flow.value,
        rules: rules.value,
        userId: authStore.user.uid,
        updatedAt: serverTimestamp(),
      }
      if (currentFormId.value) {
        await setDoc(doc(db, 'multistep-forms', currentFormId.value), payload, { merge: true })
      } else {
        const docRef = await addDoc(collection(db, 'multistep-forms'), {
          ...payload,
          createdAt: serverTimestamp(),
        })
        currentFormId.value = docRef.id
      }
      formName.value = name
      saveDraft()
    } finally {
      isSaving.value = false
    }
  }

  async function fetchSavedForms(): Promise<void> {
    const authStore = useAuthStore()
    if (!authStore.user) return
    isLoading.value = true
    try {
      const q = query(
        collection(db, 'multistep-forms'),
        where('userId', '==', authStore.user.uid),
        orderBy('updatedAt', 'desc'),
      )
      const snap = await getDocs(q)
      savedForms.value = snap.docs.map(d => ({ id: d.id, ...d.data() }) as SavedMultiStepForm)
    } finally {
      isLoading.value = false
    }
  }

  async function loadFormById(id: string): Promise<void> {
    isLoading.value = true
    try {
      const snap = await getDoc(doc(db, 'multistep-forms', id))
      if (!snap.exists()) return
      const data = snap.data() as Omit<SavedMultiStepForm, 'id'>
      steps.value = data.steps ?? []
      progressStyle.value = data.progressStyle ?? 'numbered'
      flow.value = data.flow ?? { linear: true, requireAll: true }
      rules.value = data.rules ?? []
      activeStepId.value = data.steps?.[0]?.id ?? null
      selectedElementId.value = null
      currentFormId.value = id
      formName.value = data.name ?? ''
    } finally {
      isLoading.value = false
    }
  }

  async function deleteSavedForm(id: string): Promise<void> {
    await deleteDoc(doc(db, 'multistep-forms', id))
    savedForms.value = savedForms.value.filter(f => f.id !== id)
    if (currentFormId.value === id) {
      currentFormId.value = null
      formName.value = ''
    }
  }

  function importFormAsStep(
    form: SavedForm,
    afterIndex: number | null = null
  ): { stepId: string; summary: ConversionSummary } {
    const { step, summary } = convertSavedFormToStep(form)
    if (afterIndex == null) {
      steps.value.push(step)
    } else {
      steps.value.splice(afterIndex + 1, 0, step)
    }
    activeStepId.value = step.id
    selectedElementId.value = null
    return { stepId: step.id, summary }
  }

  function applyTemplate(templateId: string) {
    const template = TEMPLATES.find(t => t.id === templateId)
    if (!template) return
    const { steps: newSteps, rules: newRules } = template.build()
    steps.value = newSteps
    activeStepId.value = newSteps[0]?.id ?? null
    selectedElementId.value = null
    rules.value = newRules
  }

  return {
    steps,
    activeStepId,
    selectedElementId,
    progressStyle,
    flow,
    rules,
    currentFormId,
    formName,
    isSaving,
    isLoading,
    savedForms,
    activeStep,
    activeStepIndex,
    selectedElement,
    totalFields,
    selectStep,
    selectElement,
    addStep,
    removeStep,
    duplicateStep,
    moveStep,
    updateStep,
    addElement,
    updateElement,
    removeElement,
    setProgressStyle,
    setFlow,
    addRule,
    updateRule,
    removeRule,
    saveDraft,
    resetDraft,
    saveToFirestore,
    fetchSavedForms,
    loadFormById,
    deleteSavedForm,
    applyTemplate,
    importFormAsStep,
  }
})
