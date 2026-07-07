import { useState } from 'react'
import { SERVER_ORIGIN } from '@/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { CursoDisponible, Matricula, Pago } from '@/types'
import RegistrarPagoForm from './RegistrarPagoForm'

interface Props {
  detalle: Matricula | null
  cursos: CursoDisponible[]
  pago: Pago | null
  cargando: boolean
  procesando: boolean
  onCerrar: () => void
  onValidar: (aprobado: boolean, observacion: string | null) => void
  onRegistrarPago: (datos: FormData) => void
  onDescargarFicha: () => void
}

export default function MatriculaDetalleDialog({
  detalle,
  cursos,
  pago,
  cargando,
  procesando,
  onCerrar,
  onValidar,
  onRegistrarPago,
  onDescargarFicha,
}: Props) {
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')

  function cerrar() {
    setRechazando(false)
    setMotivo('')
    onCerrar()
  }

  const totalCreditos = cursos.reduce((total, curso) => total + curso.creditos, 0)

  return (
    <Dialog open={detalle !== null} onOpenChange={(abierto) => !abierto && cerrar()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle>Detalle de la solicitud</DialogTitle>
        <DialogDescription>
          {detalle &&
            `${detalle.estudiante.usuario.nombres} ${detalle.estudiante.usuario.apellidos} · ${detalle.periodo.codigo}`}
        </DialogDescription>

        <div className="mt-4 space-y-2">
          {cargando ? (
            <p className="text-sm text-neutral-500">Cargando...</p>
          ) : (
            <>
              {cursos.map((curso) => (
                <div key={curso.cursoId} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {curso.codigo} - {curso.nombre}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {curso.docente} · Seccion {curso.seccion}
                    </p>
                    {curso.horarios.length > 0 && (
                      <p className="text-xs text-neutral-400">{curso.horarios.join(' | ')}</p>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500">{curso.creditos} cred.</span>
                </div>
              ))}
              <p className="text-sm text-neutral-600 pt-2">Total: {totalCreditos} creditos</p>
            </>
          )}
        </div>

        {!cargando && detalle?.estado === 'PENDIENTE' && (
          <div className="mt-5 border-t pt-4">
            {rechazando ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Motivo del rechazo</label>
                <textarea
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Indica por que se rechaza la solicitud"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    disabled={procesando || motivo.trim() === ''}
                    onClick={() => onValidar(false, motivo)}
                  >
                    {procesando ? 'Rechazando...' : 'Confirmar rechazo'}
                  </Button>
                  <Button variant="outline" disabled={procesando} onClick={() => setRechazando(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button disabled={procesando} onClick={() => onValidar(true, null)}>
                  {procesando ? 'Procesando...' : 'Aprobar'}
                </Button>
                <Button variant="destructive" disabled={procesando} onClick={() => setRechazando(true)}>
                  Rechazar
                </Button>
              </div>
            )}
          </div>
        )}

        {!cargando && detalle?.estado === 'VALIDADA' && (
          <RegistrarPagoForm procesando={procesando} onRegistrar={onRegistrarPago} />
        )}

        {!cargando && (detalle?.estado === 'PAGADA' || detalle?.estado === 'MATRICULADO') && (
          <div className="mt-5 border-t pt-4 space-y-3">
            {pago && (
              <div>
                <p className="text-sm font-medium text-neutral-700">Pago registrado</p>
                <div className="text-sm text-neutral-600 space-y-1 mt-1">
                  <p>Monto: S/. {pago.monto}</p>
                  <p>Recibo: {pago.numeroRecibo}</p>
                  {pago.metodoPago && <p>Metodo: {pago.metodoPago}</p>}
                </div>
                {pago.comprobanteUrl && (
                  <a href={`${SERVER_ORIGIN}${pago.comprobanteUrl}`} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={`${SERVER_ORIGIN}${pago.comprobanteUrl}`}
                      alt="Comprobante de pago"
                      className="mt-2 max-h-64 rounded-md border"
                    />
                  </a>
                )}
              </div>
            )}

            {detalle?.numeroFicha && (
              <p className="text-sm text-neutral-600">Ficha oficial: {detalle.numeroFicha}</p>
            )}

            <Button className="w-full" disabled={procesando} onClick={onDescargarFicha}>
              {procesando
                ? 'Generando...'
                : detalle?.estado === 'MATRICULADO'
                  ? 'Descargar ficha oficial'
                  : 'Generar ficha oficial'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
