import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/store/auth.store'

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo no valido'),
  password: z.string().min(1, 'La contrasena es requerida'),
})

type LoginForm = z.infer<typeof loginSchema>

interface LoginResponse {
  token: string
  id: number
  nombres: string
  apellidos: string
  email: string
  rol: User['rol']
}

function getRutaByRol(rol: User['rol']): string {
  if (rol === 'ADMINISTRADOR' || rol === 'DIRECCION') return '/admin'
  if (rol === 'DOCENTE') return '/cursos'
  return '/matricula'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [cargando, setCargando] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setCargando(true)
    try {
      const res = await api.post<LoginResponse>('/auth/login', data)
      const { token, ...userData } = res.data
      login(userData, token)
      toast.success(`Bienvenido, ${userData.nombres}`)
      navigate(getRutaByRol(userData.rol), { replace: true })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; email?: string; password?: string } } }
      const resData = error.response?.data

      if (resData?.email || resData?.password) {
        if (resData.email) toast.error(resData.email)
        if (resData.password) toast.error(resData.password)
      } else {
        toast.error(resData?.message ?? 'Error al iniciar sesion')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-neutral-900">Sistema Academico Integral</h1> 
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Iniciar sesion</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@uncp.edu.pe"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Contrasena</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-neutral-400">
          Sistema de uso institucional. Acceso restringido al personal autorizado.
        </p>
      </div>
    </div>
  )
}
