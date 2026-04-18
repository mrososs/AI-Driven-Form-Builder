import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBrTbGvHJKVTdpTZNlxOWp5GIPWjuJ3TbM',
  authDomain: 'ai-form-builder-113fe.firebaseapp.com',
  projectId: 'ai-form-builder-113fe',
  storageBucket: 'ai-form-builder-113fe.firebasestorage.app',
  messagingSenderId: '173295550995',
  appId: '1:173295550995:web:fb60f61a52ae733580b5e6',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
