import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const DAILY_LIMIT = 2

let cachedApp: App | null = null

export function getAdminApp(): App {
  if (cachedApp) return cachedApp
  const existing = getApps()[0]
  if (existing) return (cachedApp = existing)

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin credentials missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local',
    )
  }

  cachedApp = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return cachedApp
}

export function adminAuth() {
  return getAuth(getAdminApp())
}

export function adminDb() {
  return getFirestore(getAdminApp())
}

export async function verifyAndGetUid(token: string): Promise<{ uid: string; isAdmin: boolean }> {
  const decoded = await adminAuth().verifyIdToken(token)
  if (!decoded.email_verified) {
    throw new Error('EMAIL_NOT_VERIFIED: Please verify your email before using AI generation.')
  }
  return { uid: decoded.uid, isAdmin: decoded['admin'] === true }
}

interface QuotaResult {
  allowed: boolean
  used: number
  remaining: number
}

function todayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function checkAndIncrementQuota(uid: string, isAdmin = false): Promise<QuotaResult> {
  if (isAdmin) return { allowed: true, used: 0, remaining: Infinity as unknown as number }

  const db = adminDb()
  const usageRef = db.collection('aiUsage').doc(uid)
  const today = todayUtcDateString()

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(usageRef)
    const data = snap.exists ? (snap.data() as { count?: number; date?: string }) : {}
    const used = data.date === today ? (data.count ?? 0) : 0
    if (used >= DAILY_LIMIT) return { allowed: false, used, remaining: 0 }
    const next = used + 1
    tx.set(usageRef, { count: next, date: today, lastUsedAt: Timestamp.now() }, { merge: true })
    return { allowed: true, used: next, remaining: DAILY_LIMIT - next }
  })
}
