import { shallowRef, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  reload,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase'

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
}

function mapFirebaseError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found': 'auth.errors.userNotFound',
    'auth/wrong-password': 'auth.errors.wrongPassword',
    'auth/invalid-credential': 'auth.errors.invalidCredential',
    'auth/email-already-in-use': 'auth.errors.emailInUse',
    'auth/weak-password': 'auth.errors.weakPassword',
    'auth/invalid-email': 'auth.errors.invalidEmail',
    'auth/too-many-requests': 'auth.errors.tooManyRequests',
    'auth/network-request-failed': 'auth.errors.networkError',
  }
  return map[code] ?? 'auth.errors.generic'
}

function toAuthUser(u: User): AuthUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
    emailVerified: u.emailVerified,
  }
}

// Promise + resolver live at module scope so non-reactive/non-serializable
// function references never leak into Pinia state.
let resolveAuthReady!: () => void
const authReady = new Promise<void>((resolve) => {
  resolveAuthReady = resolve
})

export const useAuthStore = defineStore('auth', () => {
  const user = shallowRef<AuthUser | null>(null)
  const loading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)
  const isVerified = computed(() => user.value?.emailVerified === true)
  const userDisplayName = computed(() => {
    if (!user.value) return ''
    return user.value.displayName ?? user.value.email?.split('@')[0] ?? ''
  })
  const userInitial = computed(() => {
    if (!user.value) return ''
    const name = user.value.displayName ?? user.value.email ?? ''
    return name.charAt(0).toUpperCase()
  })

  function init() {
    let firstEmission = true
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser ? toAuthUser(firebaseUser) : null
      if (firstEmission) {
        firstEmission = false
        resolveAuthReady()
      }
    })
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      error.value = mapFirebaseError(err.code)
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, displayName: string) {
    loading.value = true
    error.value = null
    try {
      const { user: created } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(created, { displayName })
      await sendEmailVerification(created)
      user.value = { ...toAuthUser(created), displayName }
    } catch (err: any) {
      error.value = mapFirebaseError(err.code)
    } finally {
      loading.value = false
    }
  }

  async function sendVerification() {
    if (!auth.currentUser) return
    loading.value = true
    try {
      await sendEmailVerification(auth.currentUser)
    } catch (err: any) {
      error.value = mapFirebaseError(err.code)
    } finally {
      loading.value = false
    }
  }

  async function reloadUser() {
    if (!auth.currentUser) return
    try {
      await reload(auth.currentUser)
      user.value = toAuthUser(auth.currentUser)
    } catch (err: any) {
      console.error('Failed to reload user:', err)
    }
  }

  async function sendPasswordReset(email: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (err: any) {
      error.value = mapFirebaseError(err.code)
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await signOut(auth)
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    loading,
    error,
    authReady,
    isAuthenticated,
    isVerified,
    userDisplayName,
    userInitial,
    init,
    login,
    register,
    sendVerification,
    reloadUser,
    sendPasswordReset,
    logout,
    clearError,
  }
})
