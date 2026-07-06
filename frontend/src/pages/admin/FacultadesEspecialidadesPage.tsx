import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Especialidad, Facultad } from '@/types'

function getMensajeError(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } }
  return error.response?.data?.message ?? 'Ocurrio un error, intenta de nuevo'
}

export default function FacultadesEspecialidadesPage() {
  const [facultades, setFacultades] = useState<Facultad[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])

  const [facCodigo, setFacCodigo] = useState('')
  const [facNombre, setFacNombre] = useState('')
  const [guardandoFac, setGuardandoFac] = useState(false)

  const [espCodigo, setEspCodigo] = useState('')
  const [espNombre, setEspNombre] = useState('')
  const [espFacultadId, setEspFacultadId] = useState('')
  const [guardandoEsp, setGuardandoEsp] = useState(false)

  async function cargar() {
    try {
      const [fac, esp] = await Promise.all([
        api.get<Facultad[]>('/facultades'),
        api.get<Especialidad[]>('/especialidades'),
      ])
      setFacultades(fac.data)
      setEspecialidades(esp.data)
    } catch (err) {
      toast.error(getMensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function crearFacultad() {
    if (!facCodigo.trim() || !facNombre.trim()) {
      toast.error('Completa el codigo y el nombre de la facultad')
      return
    }
    setGuardandoFac(true)
    try {
      await api.post('/facultades', { codigo: facCodigo, nombre: facNombre })
      toast.success('Facultad creada')
      setFacCodigo('')
      setFacNombre('')
      cargar()
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setGuardandoFac(false)
    }
  }

  async function crearEspecialidad() {
    if (!espCodigo.trim() || !espNombre.trim() || !espFacultadId) {
      toast.error('Completa todos los datos de la especialidad')
      return
    }
    setGuardandoEsp(true)
    try {
      await api.post('/especialidades', {
        codigo: espCodigo,
        nombre: espNombre,
        facultadId: Number(espFacultadId),
      })
      toast.success('Especialidad creada')
      setEspCodigo('')
      setEspNombre('')
      setEspFacultadId('')
      cargar()
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setGuardandoEsp(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Facultades y Especialidades</h1>
          <p className="text-sm text-neutral-500">Registra las facultades y especialidades del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Facultades ({facultades.length})</CardTitle>
              <CardDescription>Registra una nueva facultad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Codigo"
                  value={facCodigo}
                  onChange={(e) => setFacCodigo(e.target.value)}
                />
                <input
                  className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Nombre"
                  value={facNombre}
                  onChange={(e) => setFacNombre(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={guardandoFac} onClick={crearFacultad}>
                {guardandoFac ? 'Guardando...' : 'Agregar facultad'}
              </Button>

              <div className="divide-y border-t pt-2">
                {facultades.map((f) => (
                  <div key={f.id} className="py-2 text-sm">
                    <span className="font-medium text-neutral-800">{f.codigo}</span>
                    <span className="text-neutral-500"> · {f.nombre}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Especialidades ({especialidades.length})</CardTitle>
              <CardDescription>Registra una nueva especialidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Codigo"
                  value={espCodigo}
                  onChange={(e) => setEspCodigo(e.target.value)}
                />
                <input
                  className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Nombre"
                  value={espNombre}
                  onChange={(e) => setEspNombre(e.target.value)}
                />
              </div>
              <select
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                value={espFacultadId}
                onChange={(e) => setEspFacultadId(e.target.value)}
              >
                <option value="">Facultad...</option>
                {facultades.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
              <Button className="w-full" disabled={guardandoEsp} onClick={crearEspecialidad}>
                {guardandoEsp ? 'Guardando...' : 'Agregar especialidad'}
              </Button>

              <div className="divide-y border-t pt-2">
                {especialidades.map((e) => (
                  <div key={e.id} className="py-2 text-sm">
                    <span className="font-medium text-neutral-800">{e.codigo}</span>
                    <span className="text-neutral-500"> · {e.nombre} ({e.facultad.codigo})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
