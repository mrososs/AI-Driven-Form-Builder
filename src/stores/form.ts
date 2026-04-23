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

function loadFromStorage(): {
  elements: FormElement[]
  title: string
  description: string
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function findInList(list: FormElement[], id: string): FormElement | undefined {
  for (const el of list) {
    if (el.id === id) return el
    if (el.children) {
      const found = findInList(el.children, id)
      if (found) return found
    }
  }
  return undefined
}

function removeFromList(list: FormElement[], id: string): boolean {
  const index = list.findIndex(el => el.id === id)
  if (index !== -1) {
    list.splice(index, 1)
    return true
  }
  for (const el of list) {
    if (el.children && removeFromList(el.children, id)) return true
  }
  return false
}

const DEFAULT_TITLE = 'Untitled Form'
const DEFAULT_DESCRIPTION = 'A brief description of your form'

export const useFormStore = defineStore('form', () => {
  const saved = loadFromStorage()

  const elements = ref<FormElement[]>(saved?.elements ?? [])
  const title = shallowRef<string>(saved?.title ?? DEFAULT_TITLE)
  const description = shallowRef<string>(saved?.description ?? DEFAULT_DESCRIPTION)
  const isSaving = shallowRef(false)
  const isLoading = shallowRef(false)
  const selectedElementId = shallowRef<string | null>(null)
  const userForms = ref<SavedForm[]>([])
  const currentFormId = shallowRef<string | null>(null)

  const hasElements = computed(() => elements.value.length > 0)

  function findElement(id: string): FormElement | undefined {
    return findInList(elements.value, id)
  }

  const selectedElement = computed(() => {
    if (!selectedElementId.value) return null
    return findElement(selectedElementId.value) ?? null
  })

  function selectElement(id: string | null) {
    selectedElementId.value = id
  }

  function addElement(element: FormElement) {
    elements.value.push(element)
  }

  function removeElement(id: string) {
    removeFromList(elements.value, id)
    if (selectedElementId.value === id) {
      selectedElementId.value = null
    }
  }

  function updateElement(id: string, updates: Partial<FormElement>) {
    const el = findElement(id)
    if (el) Object.assign(el, updates)
  }

  function setElements(next: FormElement[]) {
    elements.value = next
  }

  function setRowChildren(rowId: string, children: FormElement[]) {
    const row = findElement(rowId)
    if (row && row.type === 'row') row.children = children
  }

  function addOption(id: string) {
    const el = findElement(id)
    if (!el) return
    if (!el.options) el.options = []
    el.options.push(`Option ${el.options.length + 1}`)
  }

  function removeOption(id: string, index: number) {
    const el = findElement(id)
    if (el?.options) el.options.splice(index, 1)
  }

  function updateOption(id: string, index: number, value: string) {
    const el = findElement(id)
    if (el?.options) el.options[index] = value
  }

  function saveDraft() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        elements: elements.value,
        title: title.value,
        description: description.value,
      })
    )
  }

  function clearDraft() {
    elements.value = []
    title.value = DEFAULT_TITLE
    description.value = DEFAULT_DESCRIPTION
    selectedElementId.value = null
    currentFormId.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  async function saveFormToFirestore() {
    const authStore = useAuthStore()
    if (!authStore.user) return

    isSaving.value = true
    try {
      const base = {
        title: title.value,
        description: description.value,
        elements: elements.value,
        userId: authStore.user.uid,
        updatedAt: serverTimestamp(),
      }
      if (currentFormId.value) {
        await setDoc(doc(db, 'forms', currentFormId.value), base, { merge: true })
      } else {
        const created = await addDoc(collection(db, 'forms'), {
          ...base,
          createdAt: serverTimestamp(),
        })
        currentFormId.value = created.id
      }
    } catch (error) {
      console.error('Error saving form to Firestore:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  async function fetchUserForms() {
    const authStore = useAuthStore()
    if (!authStore.user) return

    isLoading.value = true
    try {
      const q = query(
        collection(db, 'forms'),
        where('userId', '==', authStore.user.uid),
        orderBy('updatedAt', 'desc')
      )
      const snap = await getDocs(q)
      userForms.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) as SavedForm[]
    } catch (error) {
      console.error('Error fetching forms:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function loadFormById(id: string) {
    const authStore = useAuthStore()
    if (!authStore.user) return
    isLoading.value = true
    try {
      const snap = await getDoc(doc(db, 'forms', id))
      if (!snap.exists()) return
      const data = snap.data() as Omit<SavedForm, 'id'>
      if (data.userId !== authStore.user.uid) return
      title.value = data.title ?? DEFAULT_TITLE
      description.value = data.description ?? DEFAULT_DESCRIPTION
      elements.value = data.elements ?? []
      currentFormId.value = id
      selectedElementId.value = null
    } catch (error) {
      console.error('Error loading form:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function deleteForm(id: string) {
    const authStore = useAuthStore()
    if (!authStore.user) return
    try {
      await deleteDoc(doc(db, 'forms', id))
      userForms.value = userForms.value.filter(f => f.id !== id)
      if (currentFormId.value === id) currentFormId.value = null
    } catch (error) {
      console.error('Error deleting form:', error)
      throw error
    }
  }

  return {
    elements,
    title,
    description,
    isSaving,
    isLoading,
    selectedElementId,
    userForms,
    currentFormId,
    hasElements,
    selectedElement,
    findElement,
    selectElement,
    addElement,
    removeElement,
    updateElement,
    setElements,
    setRowChildren,
    addOption,
    removeOption,
    updateOption,
    saveDraft,
    clearDraft,
    saveFormToFirestore,
    fetchUserForms,
    loadFormById,
    deleteForm,
  }
})
