import { useState } from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCargaDocente } from '@/hooks/useCargaDocente'
import SilaboModal from '@/components/SilaboModal'

export default function MisSilabosPage() {
  const { cargandoPeriodos, cargandoCarga, anio, semestre, carga } = useCargaDocente()
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(null)

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
          <FileText className="size-6 text-neutral-700" />
          Mis Sílabos
        </h1>
        <p className="text-sm text-neutral-500">
          Gestiona el sílabo de cada curso asignado · Periodo {anio}-{semestre}
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
                  variant="outline"
                  size="sm"
                  className="gap-2 self-start"
                  onClick={() => setSelectedAsignacionId(curso.asignacionId)}
                >
                  <FileText className="size-4" />
                  Ver / editar sílabo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedAsignacionId !== null && (
        <SilaboModal
          isOpen={selectedAsignacionId !== null}
          onClose={() => setSelectedAsignacionId(null)}
          asignacionId={selectedAsignacionId}
          mode="edit"
        />
      )}
    </div>
  )
}
