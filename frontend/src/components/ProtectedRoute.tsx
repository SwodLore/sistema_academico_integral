import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { Rol } from '@/store/auth.store'
import AppLayout from '@/components/layout/AppLayout'

interface Props {
  roles?: Rol[]
}

export default function ProtectedRoute({ roles }: Props) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && user && !roles.includes(user.rol)) {
    return <Navigate to="/403" replace />
  }

  return <AppLayout />
}
