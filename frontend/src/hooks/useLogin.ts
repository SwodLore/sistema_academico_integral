import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/api'
import { useAuth } from '@/hooks/useAuth'
import { rutaPorRol } from '@/lib/rutaPorRol'
import type { LoginForm } from '@/schemas/auth'

export function useLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [cargando, setCargando] = useState(false)

  async function ingresar(datos: LoginForm) {
    setCargando(true)
    try {
      const { token, ...usuario } = await authApi.login(datos)
      login(usuario, token)
      toast.success(`Bienvenido, ${usuario.nombres}`)
      navigate(rutaPorRol(usuario.rol), { replace: true })
    } catch (err) {
      const error = err as { response?: { data?: { message?: string; email?: string; password?: string } } }
      const data = error.response?.data
      if (data?.email) toast.error(data.email)
      else if (data?.password) toast.error(data.password)
      else toast.error(data?.message ?? 'Error al iniciar sesion')
    } finally {
      setCargando(false)
    }
  }

  return { cargando, ingresar }
}
