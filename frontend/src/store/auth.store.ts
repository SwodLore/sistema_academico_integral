import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Rol = 'ESTUDIANTE' | 'DOCENTE' | 'ADMINISTRADOR' | 'DIRECCION'

export interface User {
  id: number
  nombres: string
  apellidos: string
  email: string
  rol: Rol
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (cambios: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (cambios) =>
        set((state) => (state.user ? { user: { ...state.user, ...cambios } } : state)),
    }),
    { name: 'auth' }
  )
)
