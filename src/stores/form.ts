import { defineStore } from 'pinia'
import { db } from '../firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  type Timestamp
} from 'firebase/firestore'
import { useAuthStore } from './auth'

export interface FormElement {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  children?: FormElement[]
}

export interface SavedForm {
  id: string
  title: string
  description: string
  elements: FormElement[]
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

const STORAGE_KEY = 'form-builder-draft'

function loadFromStorage(): { elements: FormElement[]; title: string; description: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useFormStore = defineStore('form', {
  state: () => {
    const saved = loadFromStorage()
    return {
      elements: (saved?.elements ?? []) as FormElement[],
      title: saved?.title ?? 'Untitled Form',
      description: saved?.description ?? 'A brief description of your form',
      isSaving: false,
      isLoading: false,
      selectedElementId: null as string | null,
      userForms: [] as SavedForm[],
    }
  },
  getters: {
    selectedElement: (state) => {
      if (!state.selectedElementId) return null
      const findInList = (list: FormElement[]): FormElement | undefined => {
        for (const el of list) {
          if (el.id === state.selectedElementId) return el
          if (el.children) {
            const found = findInList(el.children)
            if (found) return found
          }
        }
        return undefined
      }
      return findInList(state.elements)
    }
  },
  actions: {
    selectElement(id: string | null) {
      this.selectedElementId = id
    },
    addElement(element: FormElement) {
      this.elements.push(element)
    },
    removeElement(id: string) {
      const removeFromList = (list: FormElement[]): boolean => {
        const index = list.findIndex(el => el.id === id)
        if (index !== -1) {
          list.splice(index, 1)
          return true
        }
        for (const el of list) {
          if (el.children && removeFromList(el.children)) {
            return true
          }
        }
        return false
      }
      removeFromList(this.elements)
      if (this.selectedElementId === id) {
        this.selectedElementId = null
      }
    },
    updateElement(id: string, updates: Partial<FormElement>) {
      const el = this.findElement(id)
      if (el) {
        Object.assign(el, updates)
      }
    },
    findElement(id: string): FormElement | undefined {
      const findInList = (list: FormElement[]): FormElement | undefined => {
        for (const el of list) {
          if (el.id === id) return el
          if (el.children) {
            const found = findInList(el.children)
            if (found) return found
          }
        }
        return undefined
      }
      return findInList(this.elements)
    },
    setElements(elements: FormElement[]) {
      this.elements = elements
    },
    saveDraft() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        elements: this.elements,
        title: this.title,
        description: this.description,
      }))
    },
    async saveFormToFirestore() {
      const authStore = useAuthStore()
      if (!authStore.user) return

      this.isSaving = true
      try {
        const formData = {
          title: this.title,
          description: this.description,
          elements: this.elements,
          userId: authStore.user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        await addDoc(collection(db, 'forms'), formData)
        // Optionally clear draft after successful save
        // localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Error saving form to Firestore:', error)
        throw error
      } finally {
        this.isSaving = false
      }
    },
    async fetchUserForms() {
      const authStore = useAuthStore()
      if (!authStore.user) return

      this.isLoading = true
      try {
        const q = query(
          collection(db, 'forms'),
          where('userId', '==', authStore.user.uid),
          orderBy('updatedAt', 'desc')
        )

        const querySnapshot = await getDocs(q)
        this.userForms = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SavedForm[]
      } catch (error) {
        console.error('Error fetching forms:', error)
      } finally {
        this.isLoading = false
      }
    }
  }
})
