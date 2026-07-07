import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Facultad } from '@/types'

interface Props {
  facultades: Facultad[]
  onCrear: (datos: { codigo: string; nombre: string }) => Promise<boolean>
}

export default function FacultadCard({ facultades, onCrear }: Props) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function crear() {
    setGuardando(true)
    const ok = await onCrear({ codigo, nombre })
    setGuardando(false)
    if (ok) {
      setCodigo('')
      setNombre('')
    }
  }

  return (
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
        <Button className="w-full" disabled={guardando || !codigo.trim() || !nombre.trim()} onClick={crear}>
          {guardando ? 'Guardando...' : 'Agregar facultad'}
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
  )
}
