import { adminAuth, adminDb } from '../adminInit.js'

interface FormSummary {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  elementCount: number
}

interface FormDetail {
  id: string
  title: string
  description: string
  elements: unknown[]
  createdAt: string
  updatedAt: string
}

interface MultiStepSummary {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  stepCount: number
  fieldCount: number
}

function timestampToIso(ts: unknown): string {
  if (ts && typeof ts === 'object' && 'toDate' in ts) {
    return (ts as { toDate: () => Date }).toDate().toISOString()
  }
  return String(ts ?? '')
}

async function getUidFromToken(token: string): Promise<string> {
  const decoded = await adminAuth().verifyIdToken(token)
  return decoded.uid
}

export async function listForms(token: string): Promise<FormSummary[]> {
  const uid = await getUidFromToken(token)
  const db = adminDb()
  const snap = await db.collection('forms').where('userId', '==', uid).get()

  return snap.docs.map((doc) => {
    const d = doc.data()
    return {
      id: doc.id,
      title: d.title ?? 'Untitled',
      description: d.description ?? '',
      createdAt: timestampToIso(d.createdAt),
      updatedAt: timestampToIso(d.updatedAt),
      elementCount: Array.isArray(d.elements) ? d.elements.length : 0,
    }
  })
}

export async function getForm(formId: string, token: string): Promise<FormDetail> {
  const uid = await getUidFromToken(token)
  const db = adminDb()
  const doc = await db.collection('forms').doc(formId).get()

  if (!doc.exists) throw new Error(`Form not found: ${formId}`)

  const d = doc.data()!
  if (d.userId !== uid) throw new Error('Access denied: this form belongs to another user.')

  return {
    id: doc.id,
    title: d.title ?? 'Untitled',
    description: d.description ?? '',
    elements: d.elements ?? [],
    createdAt: timestampToIso(d.createdAt),
    updatedAt: timestampToIso(d.updatedAt),
  }
}

export async function listMultiStepForms(token: string): Promise<MultiStepSummary[]> {
  const uid = await getUidFromToken(token)
  const db = adminDb()
  const snap = await db.collection('multistep-forms').where('userId', '==', uid).get()

  return snap.docs.map((doc) => {
    const d = doc.data()
    const steps: unknown[] = Array.isArray(d.steps) ? d.steps : []
    const fieldCount = steps.reduce<number>((acc, step) => {
      const s = step as { elements?: unknown[] }
      return acc + (Array.isArray(s.elements) ? s.elements.length : 0)
    }, 0)

    return {
      id: doc.id,
      name: d.name ?? 'Untitled',
      createdAt: timestampToIso(d.createdAt),
      updatedAt: timestampToIso(d.updatedAt),
      stepCount: steps.length,
      fieldCount,
    }
  })
}

export async function getMultiStepForm(formId: string, token: string): Promise<unknown> {
  const uid = await getUidFromToken(token)
  const db = adminDb()
  const doc = await db.collection('multistep-forms').doc(formId).get()

  if (!doc.exists) throw new Error(`Multi-step form not found: ${formId}`)

  const d = doc.data()!
  if (d.userId !== uid) throw new Error('Access denied: this form belongs to another user.')

  return {
    id: doc.id,
    ...d,
    createdAt: timestampToIso(d.createdAt),
    updatedAt: timestampToIso(d.updatedAt),
  }
}
