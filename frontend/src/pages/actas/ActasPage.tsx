import { useState } from 'react'
import { useActasAdmin } from '@/hooks/useActasAdmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClipboardCheck } from 'lucide-react'
import { ESTADO_ACTA_LABELS, type ActaResumen, type EstadoActa } from '@/types'
import ActaDetalleDialog from './components/ActaDetalleDialog'

const ESTADO_VARIANTE: Record<EstadoActa, 'info' | 'warning' | 'success' | 'default'> = {
  ABIERTA: 'info',
  OBSERVADA: 'warning',
  VALIDADA: 'success',
  CERRADA: 'default',
}

export default function ActasPage() {
  const {
    cargandoPeriodos,
    cargandoActas,
    procesando,
    anio,
    semestre,
    actas,
    aniosDisponibles,
    semestresDisponibles,
    cambiarAnio,
    setSemestre,
    validar,
    observar,
  } = useActasAdmin()

  const [seleccionada, setSeleccionada] = useState<ActaResumen | null>(null)

  const validadas = actas.filter((a) => a.estadoActa === 'VALIDADA').length

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-neutral-400" />
            Validación de Actas de Notas
          </h1>
          <p className="text-sm text-neutral-500">
            Revisa las actas enviadas por los docentes, valídalas u obsérvalas para su corrección.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  Actas del semestre ({actas.length})
                </CardTitle>
                <CardDescription>
                  {validadas} validada(s) · {actas.length - validadas} pendiente(s) de validar
                </CardDescription>
              </div>
              <div className="flex gap-3">
                <select
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  value={anio}
                  disabled={cargandoPeriodos}
                  onChange={(e) => cambiarAnio(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  {aniosDisponibles.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <select
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  value={semestre}
                  disabled={cargandoPeriodos}
                  onChange={(e) => setSemestre(e.target.value)}
                >
                  {semestresDisponibles.map((s) => (
                    <option key={s} value={s}>Semestre {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {cargandoActas || cargandoPeriodos ? (
              <p className="text-sm text-neutral-500 py-8 text-center">Cargando actas...</p>
            ) : actas.length === 0 ? (
              <p className="text-sm text-neutral-500 py-8 text-center">
                No hay actas registradas para este periodo.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                      <th className="px-4 py-3 font-semibold text-neutral-600">Curso</th>
                      <th className="px-3 py-3 font-semibold text-neutral-600">Docente</th>
                      <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Notas</th>
                      <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Estado</th>
                      <th className="px-4 py-3 font-semibold text-neutral-600 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actas.map((acta) => (
                      <tr key={acta.actaId} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-neutral-800">{acta.cursoNombre}</div>
                          <div className="text-xs text-neutral-400">
                            {acta.cursoCodigo} · Sec. {acta.seccion} · {acta.especialidad}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-neutral-600">{acta.docente}</td>
                        <td className="px-3 py-3 text-center text-xs text-neutral-500">
                          <span className="text-green-700 font-semibold">{acta.aprobados}</span> /{' '}
                          <span className="text-red-700 font-semibold">{acta.desaprobados}</span> /{' '}
                          <span className="text-neutral-400 font-semibold">{acta.pendientes}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Badge variant={ESTADO_VARIANTE[acta.estadoActa]} className="text-[10px] font-bold uppercase tracking-wider">
                            {ESTADO_ACTA_LABELS[acta.estadoActa]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="outline" size="sm" onClick={() => setSeleccionada(acta)}>
                            Ver detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="px-4 py-2 text-[11px] text-neutral-400">
                  Notas: aprobados / desaprobados / pendientes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ActaDetalleDialog
        acta={seleccionada}
        procesando={procesando}
        onCerrar={() => setSeleccionada(null)}
        onValidar={validar}
        onObservar={observar}
      />
    </div>
  )
}
