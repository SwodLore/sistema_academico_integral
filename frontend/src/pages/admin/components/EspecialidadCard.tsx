import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Especialidad, Facultad } from '@/types'

interface Props {
  especialidades: Especialidad[]
  facultades: Facultad[]
  onCrear: (datos: { codigo: string; nombre: string; facultadId: number }) => Promise<boolean>
}

export default function EspecialidadCard({ especialidades, facultades, onCrear }: Props) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [facultadId, setFacultadId] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function crear() {
    setGuardando(true)
    const ok = await onCrear({ codigo, nombre, facultadId: Number(facultadId) })
    setGuardando(false)
    if (ok) {
      setCodigo('')
      setNombre('')
      setFacultadId('')
    }
  }

  return (
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
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <input
            className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <select
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          value={facultadId}
          onChange={(e) => setFacultadId(e.target.value)}
        >
          <option value="">Facultad...</option>
          {facultades.map((f) => (
            <option key={f.id} value={f.id}>{f.nombre}</option>
          ))}
        </select>
        <Button
          className="w-full"
          disabled={guardando || !codigo.trim() || !nombre.trim() || !facultadId}
          onClick={crear}
        >
          {guardando ? 'Guardando...' : 'Agregar especialidad'}
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
  )
}
