import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { CursosDisponibles } from '@/types'

interface Props {
  oferta: CursosDisponibles
  enviando: boolean
  onSolicitar: (cursosIds: number[]) => void
}

export default function SeleccionCursosCard({ oferta, enviando, onSolicitar }: Props) {
  const [seleccionados, setSeleccionados] = useState<number[]>([])

  const creditos = oferta.cursos
    .filter((c) => seleccionados.includes(c.cursoId))
    .reduce((total, c) => total + c.creditos, 0)
  const excede = creditos > oferta.maxCreditos

  function toggleCurso(cursoId: number) {
    setSeleccionados((prev) =>
      prev.includes(cursoId) ? prev.filter((id) => id !== cursoId) : [...prev, cursoId]
    )
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Solicitud de Matricula</h1>
        <p className="text-sm text-neutral-500">
          Periodo {oferta.anio}-{oferta.semestre} · Ciclo {oferta.ciclo}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Cursos disponibles</CardTitle>
              <CardDescription>Selecciona los cursos que vas a llevar</CardDescription>
            </div>
            <span className={`text-sm font-medium ${excede ? 'text-red-600' : 'text-neutral-700'}`}>
              {creditos} / {oferta.maxCreditos} creditos
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {oferta.cursos.length === 0 && (
            <p className="text-sm text-neutral-500">
              No hay cursos disponibles para tu ciclo en este periodo.
            </p>
          )}

          {oferta.cursos.map((curso) => (
            <label
              key={curso.cursoId}
              className={`flex items-start gap-3 border rounded-md px-3 py-3 cursor-pointer transition-colors ${
                seleccionados.includes(curso.cursoId)
                  ? 'border-neutral-900 bg-neutral-100'
                  : 'hover:bg-neutral-50'
              }`}
            >
              <Checkbox
                className="mt-1"
                checked={seleccionados.includes(curso.cursoId)}
                onCheckedChange={() => toggleCurso(curso.cursoId)}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-900">
                    {curso.codigo} - {curso.nombre}
                  </p>
                  <span className="text-xs text-neutral-500">{curso.creditos} cred.</span>
                </div>
                <p className="text-xs text-neutral-500">
                  {curso.docente} · Seccion {curso.seccion}
                </p>
                {curso.horarios.length > 0 && (
                  <p className="text-xs text-neutral-400">{curso.horarios.join(' | ')}</p>
                )}
              </div>
            </label>
          ))}

          {excede && <p className="text-xs text-red-600">Superaste el limite de creditos permitido.</p>}

          <Button
            className="w-full"
            disabled={enviando || seleccionados.length === 0 || excede}
            onClick={() => onSolicitar(seleccionados)}
          >
            {enviando ? 'Enviando...' : 'Enviar solicitud de matricula'}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
