import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  hydrate: () => void
  logout: () => void
}

const STORAGE_KEY = 'chordbook:user'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    set({ user })
  },
  setLoading: (loading) => set({ isLoading: loading }),
  hydrate: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false })
      return
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    let user: User | null = null
    if (stored) {
      try {
        user = JSON.parse(stored) as User
      } catch {
        user = null
      }
    }
    set({ user, isLoading: false })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    set({ user: null })
  },
}))
