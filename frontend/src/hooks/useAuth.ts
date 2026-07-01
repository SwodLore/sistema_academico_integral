import { useAuthStore } from '@/store/auth.store'
import type { Rol } from '@/store/auth.store'

export function useAuth() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore()

  function hasRole(...roles: Rol[]) {
    if (!user) return false
    return roles.includes(user.rol)
  }

  return { user, token, isAuthenticated, login, logout, hasRole }
}
