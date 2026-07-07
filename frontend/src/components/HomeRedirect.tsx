import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { rutaPorRol } from '@/lib/rutaPorRol'

// Redirige la raiz a la pantalla inicial de cada rol
export default function HomeRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  return <Navigate to={rutaPorRol(user.rol)} replace />
}
