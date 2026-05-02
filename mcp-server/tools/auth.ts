const FIREBASE_API_KEY = 'AIzaSyBrTbGvHJKVTdpTZNlxOWp5GIPWjuJ3TbM'
const SIGN_IN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`

interface SignInResponse {
  idToken: string
  email: string
  displayName: string
  expiresIn: string
  localId: string
}

interface FirebaseErrorResponse {
  error: { message: string; code: number }
}

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_NOT_FOUND: 'No account found with that email address.',
  INVALID_PASSWORD: 'Incorrect password.',
  INVALID_EMAIL: 'Invalid email address.',
  USER_DISABLED: 'This account has been disabled.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many failed attempts. Please try again later.',
  INVALID_LOGIN_CREDENTIALS: 'Incorrect email or password.',
}

export async function authenticate(email: string, password: string): Promise<string> {
  const res = await fetch(SIGN_IN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })

  const data = (await res.json()) as SignInResponse | FirebaseErrorResponse

  if (!res.ok) {
    const errData = data as FirebaseErrorResponse
    const rawCode = errData.error?.message ?? 'UNKNOWN_ERROR'
    const friendly = FIREBASE_ERROR_MESSAGES[rawCode] ?? `Authentication failed: ${rawCode}`
    throw new Error(friendly)
  }

  return (data as SignInResponse).idToken
}
