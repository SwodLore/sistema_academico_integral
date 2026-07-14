import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMatriculasAdmin } from '@/hooks/useMatriculasAdmin'
import { useMatriculaDetalle } from '@/hooks/useMatriculaDetalle'
import { ESTADO_MATRICULA_LABELS, type EstadoMatricula } from '@/types'
import SolicitudesTable from './components/SolicitudesTable'
import MatriculaDetalleDialog from './components/MatriculaDetalleDialog'
import SilaboModal from '@/components/SilaboModal'

const ESTADOS_FILTRO: EstadoMatricula[] = ['PENDIENTE', 'PAGADA', 'MATRICULADO', 'RECHAZADA']

export default function AdminPage() {
  const {
    cargando,
    filtradas,
    especialidades,
    conteos,
    filtroEstado,
    setFiltroEstado,
    filtroEspecialidad,
    setFiltroEspecialidad,
    recargar,
  } = useMatriculasAdmin()

  const detalle = useMatriculaDetalle(recargar)
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Solicitudes de Matricula</h1>
          <p className="text-sm text-neutral-500">Gestiona las solicitudes por estado</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  {ESTADO_MATRICULA_LABELS[filtroEstado]} ({filtradas.length})
                </CardTitle>
                <CardDescription>Ordenadas de la mas antigua a la mas reciente</CardDescription>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <select
                  className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm sm:w-[180px]"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as EstadoMatricula)}
                >
                  {ESTADOS_FILTRO.map((estado) => (
                    <option key={estado} value={estado}>
                      {ESTADO_MATRICULA_LABELS[estado]} ({conteos[estado]})
                    </option>
                  ))}
                </select>
                <select
                  className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm sm:w-[260px]"
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                >
                  <option value="">Todas las especialidades</option>
                  {especialidades.map((esp) => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <p className="text-sm text-neutral-500 py-8 text-center">Cargando...</p>
            ) : filtradas.length === 0 ? (
              <p className="text-sm text-neutral-500 py-8 text-center">No hay solicitudes en este estado.</p>
            ) : (
              <SolicitudesTable solicitudes={filtradas} onVerDetalle={detalle.abrir} />
            )}
          </CardContent>
        </Card>
      </div>

      <MatriculaDetalleDialog
        detalle={detalle.detalle}
        cursos={detalle.cursos}
        pago={detalle.pago}
        cargando={detalle.cargando}
        procesando={detalle.procesando}
        onCerrar={detalle.cerrar}
        onValidar={detalle.validar}
        onRegistrarPago={detalle.registrarPago}
        onDescargarFicha={detalle.descargarFichaOficial}
        onVerSilabo={setSelectedAsignacionId}
      />

      {selectedAsignacionId !== null && (
        <SilaboModal
          isOpen={selectedAsignacionId !== null}
          onClose={() => setSelectedAsignacionId(null)}
          asignacionId={selectedAsignacionId}
          mode="read"
        />
      )}
    </div>
  )
}
