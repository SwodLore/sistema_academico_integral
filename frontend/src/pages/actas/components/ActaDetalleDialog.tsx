import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { actasApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2, MessageSquareWarning, XCircle } from 'lucide-react'
import { ESTADO_ACTA_LABELS, type ActaNotasDetalle, type ActaResumen, type EstadoActa } from '@/types'

const ESTADO_VARIANTE: Record<EstadoActa, 'info' | 'warning' | 'success' | 'default'> = {
  ABIERTA: 'info',
  OBSERVADA: 'warning',
  VALIDADA: 'success',
  CERRADA: 'default',
}

interface Props {
  acta: ActaResumen | null
  procesando: boolean
  onCerrar: () => void
  onValidar: (actaId: number) => Promise<boolean>
  onObservar: (actaId: number, observacion: string) => Promise<boolean>
}

function nota(valor: number | null): string {
  return valor === null || valor === undefined ? '-' : Number(valor).toFixed(2)
}

export default function ActaDetalleDialog({ acta, procesando, onCerrar, onValidar, onObservar }: Props) {
  const [detalle, setDetalle] = useState<ActaNotasDetalle | null>(null)
  const [cargando, setCargando] = useState(false)
  const [observando, setObservando] = useState(false)
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    if (!acta) return
    setObservando(false)
    setMotivo('')
    setDetalle(null)
    setCargando(true)
    actasApi
      .detalle(acta.actaId)
      .then(setDetalle)
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setCargando(false))
  }, [acta])

  function cerrar() {
    setObservando(false)
    setMotivo('')
    onCerrar()
  }

  async function validar() {
    if (!acta) return
    if (await onValidar(acta.actaId)) cerrar()
  }

  async function observar() {
    if (!acta) return
    if (await onObservar(acta.actaId, motivo.trim())) cerrar()
  }

  const yaValidada = acta?.estadoActa === 'VALIDADA'

  return (
    <Dialog open={acta !== null} onOpenChange={(abierto) => !abierto && cerrar()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogTitle className="flex items-center gap-2 pr-6">
          {acta?.cursoNombre}
          {acta && (
            <Badge variant={ESTADO_VARIANTE[acta.estadoActa]} className="text-[10px] font-bold uppercase tracking-wider">
              {ESTADO_ACTA_LABELS[acta.estadoActa]}
            </Badge>
          )}
        </DialogTitle>
        <DialogDescription>
          {acta &&
            `${acta.cursoCodigo} · Sec. ${acta.seccion} · ${acta.periodo} · Docente: ${acta.docente}`}
        </DialogDescription>

        {acta?.observacion && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            <MessageSquareWarning className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <b>Observación:</b> {acta.observacion}
            </span>
          </div>
        )}

        <div className="mt-4">
          {cargando ? (
            <p className="text-sm text-neutral-500 py-8 text-center">Cargando notas...</p>
          ) : !detalle ? (
            <p className="text-sm text-neutral-500 py-8 text-center">No se pudo cargar el detalle.</p>
          ) : detalle.estudiantes.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8 text-center">
              No hay estudiantes matriculados en este curso.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                    <th className="px-3 py-2 font-semibold text-neutral-600">Estudiante</th>
                    <th className="px-2 py-2 font-semibold text-neutral-600 text-center">P1</th>
                    <th className="px-2 py-2 font-semibold text-neutral-600 text-center">P2</th>
                    <th className="px-2 py-2 font-semibold text-neutral-600 text-center">Prac.</th>
                    <th className="px-2 py-2 font-semibold text-neutral-600 text-center">Final</th>
                    <th className="px-2 py-2 font-semibold text-neutral-600 text-center">Prom.</th>
                    <th className="px-3 py-2 font-semibold text-neutral-600 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.estudiantes.map((e) => (
                    <tr key={e.detalleId} className="border-b border-neutral-100 last:border-0">
                      <td className="px-3 py-2">
                        <div className="font-medium text-neutral-800">{e.nombreCompleto}</div>
                        <div className="text-xs text-neutral-400">{e.codigoEstudiante}</div>
                      </td>
                      <td className="px-2 py-2 text-center text-neutral-700">{nota(e.parcial1)}</td>
                      <td className="px-2 py-2 text-center text-neutral-700">{nota(e.parcial2)}</td>
                      <td className="px-2 py-2 text-center text-neutral-700">{nota(e.practicas)}</td>
                      <td className="px-2 py-2 text-center text-neutral-700">{nota(e.notaFinal)}</td>
                      <td
                        className={`px-2 py-2 text-center font-bold ${
                          e.promedio === null
                            ? 'text-neutral-300'
                            : e.estado === 'APROBADO'
                              ? 'text-green-700'
                              : 'text-red-700'
                        }`}
                      >
                        {nota(e.promedio)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {e.estado === 'APROBADO' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado
                          </span>
                        )}
                        {e.estado === 'DESAPROBADO' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                            <XCircle className="w-3.5 h-3.5" /> Desaprobado
                          </span>
                        )}
                        {e.estado === 'PENDIENTE' && (
                          <span className="text-xs font-medium text-neutral-400">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {detalle && detalle.pendientes > 0 && !yaValidada && (
          <p className="mt-3 text-xs text-yellow-700">
            Atención: {detalle.pendientes} estudiante(s) aún sin notas completas.
          </p>
        )}

        {/* Acciones */}
        {!cargando && detalle && !yaValidada && (
          <div className="mt-5 border-t pt-4">
            {observando ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Motivo de la observación</label>
                <textarea
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  rows={3}
                  value={motivo}
                  onChange={(ev) => setMotivo(ev.target.value)}
                  placeholder="Indica qué debe corregir el docente"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    disabled={procesando || motivo.trim() === ''}
                    onClick={observar}
                  >
                    {procesando ? 'Enviando...' : 'Confirmar observación'}
                  </Button>
                  <Button variant="outline" disabled={procesando} onClick={() => setObservando(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button disabled={procesando} onClick={validar} className="gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {procesando ? 'Procesando...' : 'Validar acta'}
                </Button>
                <Button
                  variant="outline"
                  disabled={procesando}
                  onClick={() => setObservando(true)}
                  className="gap-1.5"
                >
                  <MessageSquareWarning className="w-4 h-4" />
                  Observar
                </Button>
              </div>
            )}
          </div>
        )}

        {yaValidada && (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Esta acta ya fue validada y consolidada oficialmente.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
