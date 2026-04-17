import { defineStore } from 'pinia'

export interface FormElement {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  children?: FormElement[]
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
      selectedElementId: null as string | null,
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
    saveForm() {
      this.isSaving = true
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          elements: this.elements,
          title: this.title,
          description: this.description,
        }))
      } finally {
        this.isSaving = false
      }
    }
  }
})
