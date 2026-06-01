import { create } from 'zustand'

export type Role = 'admin' | 'secretaire' | 'moniteur' | 'eleve'

export interface AuthUser {
  id: number
  name: string
  email: string
  roles: Role[]
  is_active: boolean
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  hasRole: (role: Role) => boolean
  primaryRole: () => Role | null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  hasRole: (role) => {
    const { user } = get()
    return user?.roles.includes(role) ?? false
  },

  primaryRole: () => {
    const { user } = get()
    if (!user?.roles.length) return null
    const priority: Role[] = ['admin', 'secretaire', 'moniteur', 'eleve']
    return priority.find((r) => user.roles.includes(r)) ?? user.roles[0]
  },
}))
