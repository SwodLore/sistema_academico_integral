import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { perfilApi } from '@/api/perfil'
import { useAuth } from '@/hooks/useAuth'
import { getApiError } from '@/lib/apiError'

const ROL_LABELS: Record<string, string> = {
  ESTUDIANTE: 'Estudiante',
  DOCENTE: 'Docente',
  ADMINISTRADOR: 'Administrador',
  DIRECCION: 'Dirección',
}

export default function PerfilPage() {
  const { user, updateUser } = useAuth()

  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardandoDatos, setGuardandoDatos] = useState(false)

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirma, setPasswordConfirma] = useState('')
  const [guardandoPassword, setGuardandoPassword] = useState(false)

  useEffect(() => {
    perfilApi
      .obtener()
      .then((p) => {
        setNombres(p.nombres)
        setApellidos(p.apellidos)
        setEmail(p.email)
        setCodigo(p.codigoUsuario)
      })
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setCargando(false))
  }, [])

  async function guardarDatos(e: React.FormEvent) {
    e.preventDefault()
    setGuardandoDatos(true)
    try {
      const p = await perfilApi.actualizar({ nombres: nombres.trim(), apellidos: apellidos.trim() })
      updateUser({ nombres: p.nombres, apellidos: p.apellidos })
      toast.success('Datos actualizados correctamente')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setGuardandoDatos(false)
    }
  }

  async function guardarPassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordNueva !== passwordConfirma) {
      toast.error('La nueva contraseña y su confirmación no coinciden')
      return
    }
    setGuardandoPassword(true)
    try {
      await perfilApi.cambiarPassword({ passwordActual, passwordNueva })
      toast.success('Contraseña actualizada correctamente')
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordConfirma('')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setGuardandoPassword(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none'
  const labelClass = 'text-xs font-semibold text-neutral-600'

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
            <User className="size-6 text-neutral-700" />
            Mi Perfil
          </h1>
          <p className="text-sm text-neutral-500">
            {user ? `${ROL_LABELS[user.rol] ?? user.rol} · ${email || user.email}` : 'Gestiona tu cuenta'}
          </p>
        </div>

        {cargando ? (
          <p className="text-sm text-neutral-500 py-8 text-center">Cargando...</p>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos personales</CardTitle>
                <CardDescription>Actualiza tu nombre. El email y el código no se pueden modificar.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={guardarDatos} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className={labelClass}>Nombres</label>
                      <input className={inputClass} value={nombres} onChange={(e) => setNombres(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Apellidos</label>
                      <input className={inputClass} value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Email</label>
                      <input className={`${inputClass} bg-neutral-100 text-neutral-500`} value={email} disabled />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Código</label>
                      <input className={`${inputClass} bg-neutral-100 text-neutral-500`} value={codigo} disabled />
                    </div>
                  </div>
                  <Button type="submit" disabled={guardandoDatos}>
                    {guardandoDatos ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="size-4 text-neutral-600" />
                  Cambiar contraseña
                </CardTitle>
                <CardDescription>Necesitas tu contraseña actual para establecer una nueva.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={guardarPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Contraseña actual</label>
                    <input
                      type="password"
                      className={inputClass}
                      value={passwordActual}
                      onChange={(e) => setPasswordActual(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className={labelClass}>Nueva contraseña</label>
                      <input
                        type="password"
                        className={inputClass}
                        value={passwordNueva}
                        onChange={(e) => setPasswordNueva(e.target.value)}
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Confirmar nueva contraseña</label>
                      <input
                        type="password"
                        className={inputClass}
                        value={passwordConfirma}
                        onChange={(e) => setPasswordConfirma(e.target.value)}
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={guardandoPassword}>
                    {guardandoPassword ? 'Guardando...' : 'Cambiar contraseña'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
