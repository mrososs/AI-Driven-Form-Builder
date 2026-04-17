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

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    let _resolveAuthReady!: () => void
    const authReady = new Promise<void>((resolve) => {
      _resolveAuthReady = resolve
    })
    return {
      user: null as AuthUser | null,
      loading: false,
      error: null as string | null,
      authReady,
      _resolveAuthReady,
    }
  },

  getters: {
    isAuthenticated: (state) => state.user !== null,
    isVerified: (state) => state.user?.emailVerified === true,
    userDisplayName: (state): string => {
      if (!state.user) return ''
      return state.user.displayName ?? state.user.email?.split('@')[0] ?? ''
    },
    userInitial: (state): string => {
      if (!state.user) return ''
      const name = state.user.displayName ?? state.user.email ?? ''
      return name.charAt(0).toUpperCase()
    },
  },

  actions: {
    init() {
      let firstEmission = true
      onAuthStateChanged(auth, (firebaseUser) => {
        this.user = firebaseUser ? toAuthUser(firebaseUser) : null
        if (firstEmission) {
          firstEmission = false
          this._resolveAuthReady()
        }
      })
    },

    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      try {
        await signInWithEmailAndPassword(auth, email, password)
      } catch (err: any) {
        this.error = mapFirebaseError(err.code)
      } finally {
        this.loading = false
      }
    },

    async register(email: string, password: string, displayName: string) {
      this.loading = true
      this.error = null
      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        console.log('User created:', user.uid)
        
        await updateProfile(user, { displayName })
        console.log('Profile updated')
        
        // Send verification email
        await sendEmailVerification(user)
        console.log('Verification email sent successfully')
        
        // Update local user state
        this.user = toAuthUser(user)
        if (this.user) this.user.displayName = displayName
      } catch (err: any) {
        this.error = mapFirebaseError(err.code)
      } finally {
        this.loading = false
      }
    },

    async sendVerification() {
      if (!auth.currentUser) return
      this.loading = true
      try {
        await sendEmailVerification(auth.currentUser)
      } catch (err: any) {
        this.error = mapFirebaseError(err.code)
      } finally {
        this.loading = false
      }
    },

    async reloadUser() {
      if (!auth.currentUser) return
      try {
        await reload(auth.currentUser)
        this.user = toAuthUser(auth.currentUser)
      } catch (err: any) {
        console.error('Failed to reload user:', err)
      }
    },

    async sendPasswordReset(email: string): Promise<boolean> {
      this.loading = true
      this.error = null
      try {
        await sendPasswordResetEmail(auth, email)
        return true
      } catch (err: any) {
        this.error = mapFirebaseError(err.code)
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await signOut(auth)
    },

    clearError() {
      this.error = null
    },
  },
})
