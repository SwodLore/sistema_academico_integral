import { useNavigate } from 'react-router-dom'
import { ClipboardList, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCargaDocente } from '@/hooks/useCargaDocente'

export default function RegistroNotasPage() {
  const navigate = useNavigate()
  const { cargandoPeriodos, cargandoCarga, anio, semestre, carga } = useCargaDocente()

  if (cargandoPeriodos || cargandoCarga) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
        <p className="text-neutral-500 text-sm">Cargando cursos...</p>
      </div>
    )
  }

  const cursos = carga?.cursos ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
          <ClipboardList className="size-6 text-neutral-700" />
          Registro de Notas
        </h1>
        <p className="text-sm text-neutral-500">
          Selecciona un curso para registrar las notas de sus estudiantes · Periodo {anio}-{semestre}
        </p>
      </div>

      {cursos.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-neutral-500 py-8 text-center">
              No tienes cursos asignados en este periodo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cursos.map((curso) => (
            <Card key={curso.asignacionId}>
              <CardContent className="flex flex-col gap-3 pt-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {curso.codigo} - {curso.nombre}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Sección {curso.seccion} · {curso.creditos} créditos
                    {curso.especialidadNombre ? ` · ${curso.especialidadNombre}` : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-2 self-start"
                  onClick={() => navigate(`/cursos/${curso.asignacionId}/notas`)}
                >
                  <ClipboardList className="size-4" />
                  Registrar notas
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
