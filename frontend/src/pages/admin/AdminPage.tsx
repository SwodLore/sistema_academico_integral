import { useEffect, useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ESTADO_MATRICULA_LABELS, type EstadoMatricula, type Matricula, type Pago } from '@/types'

interface CursoDetalle {
  cursoId: number
  codigo: string
  nombre: string
  creditos: number
  docente: string
  seccion: string
  horarios: string[]
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const ESTADO_VARIANTS: Record<EstadoMatricula, 'warning' | 'info' | 'destructive' | 'success'> = {
  PENDIENTE: 'warning',
  VALIDADA: 'info',
  RECHAZADA: 'destructive',
  PAGADA: 'success',
  MATRICULADO: 'success',
}

const ESTADOS_FILTRO: EstadoMatricula[] = ['PENDIENTE', 'VALIDADA', 'PAGADA', 'MATRICULADO']

function getMensajeError(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } }
  return error.response?.data?.message ?? 'Ocurrio un error, intenta de nuevo'
}

const columnHelper = createColumnHelper<Matricula>()

export default function AdminPage() {
  const [cargando, setCargando] = useState(true)
  const [solicitudes, setSolicitudes] = useState<Matricula[]>([])
  const [filtroEstado, setFiltroEstado] = useState<EstadoMatricula>('PENDIENTE')
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('')
  const [detalle, setDetalle] = useState<Matricula | null>(null)
  const [cursos, setCursos] = useState<CursoDetalle[]>([])
  const [cargandoCursos, setCargandoCursos] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')

  const [monto, setMonto] = useState('')
  const [numeroRecibo, setNumeroRecibo] = useState('')
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [pago, setPago] = useState<Pago | null>(null)

  async function cargar() {
    setCargando(true)
    try {
      const res = await api.get<Matricula[]>('/matriculas', {
        params: { estado: filtroEstado },
      })
      setSolicitudes(res.data)
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado])

  const especialidades = useMemo(
    () => [...new Set(solicitudes.map((s) => s.estudiante.especialidad.nombre))],
    [solicitudes]
  )

  const filtradas = useMemo(
    () =>
      solicitudes.filter(
        (s) => !filtroEspecialidad || s.estudiante.especialidad.nombre === filtroEspecialidad
      ),
    [solicitudes, filtroEspecialidad]
  )

  async function verDetalle(solicitud: Matricula) {
    setDetalle(solicitud)
    setRechazando(false)
    setMotivo('')
    setMonto('')
    setNumeroRecibo('')
    setMetodoPago('EFECTIVO')
    setComprobante(null)
    setPago(null)
    setCargandoCursos(true)
    try {
      const res = await api.get<CursoDetalle[]>(`/matriculas/${solicitud.id}/cursos`)
      setCursos(res.data)
      if (solicitud.estado === 'PAGADA' || solicitud.estado === 'MATRICULADO') {
        const resPago = await api.get<Pago | null>(`/matriculas/${solicitud.id}/pago`)
        setPago(resPago.data)
      }
    } catch (err) {
      toast.error(getMensajeError(err))
      setDetalle(null)
    } finally {
      setCargandoCursos(false)
    }
  }

  function cerrarDetalle() {
    setDetalle(null)
    setRechazando(false)
    setMotivo('')
  }

  async function validar(aprobado: boolean) {
    if (!detalle) return
    setProcesando(true)
    try {
      await api.put(`/matriculas/${detalle.id}/validar`, {
        aprobado,
        observacion: aprobado ? null : motivo,
      })
      toast.success(aprobado ? 'Matricula aprobada' : 'Matricula rechazada')
      cerrarDetalle()
      cargar()
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setProcesando(false)
    }
  }

  async function registrarPago() {
    if (!detalle) return
    setProcesando(true)
    try {
      const form = new FormData()
      form.append('monto', monto)
      form.append('numeroRecibo', numeroRecibo)
      form.append('metodoPago', metodoPago)
      if (comprobante) form.append('comprobante', comprobante)

      await api.post(`/matriculas/${detalle.id}/pago`, form)
      toast.success('Pago registrado')
      cerrarDetalle()
      cargar()
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setProcesando(false)
    }
  }

  async function descargarFichaOficial() {
    if (!detalle) return
    setDescargando(true)
    try {
      const res = await api.get<Blob>(`/matriculas/${detalle.id}/ficha-oficial`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = `ficha_oficial_${detalle.estudiante.codigoEstudiante}_${detalle.periodo.codigo}.pdf`
      enlace.click()
      URL.revokeObjectURL(url)
      cerrarDetalle()
      cargar()
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setDescargando(false)
    }
  }

  const columnas = useMemo(
    () => [
      columnHelper.accessor((m) => `${m.estudiante.usuario.nombres} ${m.estudiante.usuario.apellidos}`, {
        id: 'estudiante',
        header: 'Estudiante',
      }),
      columnHelper.accessor((m) => m.estudiante.codigoEstudiante, {
        id: 'codigo',
        header: 'Codigo',
      }),
      columnHelper.accessor((m) => m.estudiante.especialidad.nombre, {
        id: 'especialidad',
        header: 'Especialidad',
      }),
      columnHelper.accessor((m) => m.estudiante.cicloActual, {
        id: 'ciclo',
        header: 'Ciclo',
      }),
      columnHelper.accessor((m) => m.periodo.codigo, {
        id: 'periodo',
        header: 'Periodo',
      }),
      columnHelper.accessor((m) => m.estado, {
        id: 'estado',
        header: 'Estado',
        cell: (info) => (
          <Badge variant={ESTADO_VARIANTS[info.getValue()]}>
            {ESTADO_MATRICULA_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <Button size="sm" variant="outline" onClick={() => verDetalle(row.original)}>
            Ver detalle
          </Button>
        ),
      }),
    ],
    []
  )

  const tabla = useReactTable({
    data: filtradas,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalCreditos = cursos.reduce((t, c) => t + c.creditos, 0)
  const montoValido = Number(monto) > 0
  const puedePagar = montoValido && numeroRecibo.trim() !== ''

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
              <div className="flex gap-3">
                <select
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as EstadoMatricula)}
                >
                  {ESTADOS_FILTRO.map((estado) => (
                    <option key={estado} value={estado}>{ESTADO_MATRICULA_LABELS[estado]}</option>
                  ))}
                </select>
                <select
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
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
              <p className="text-sm text-neutral-500 py-8 text-center">
                No hay solicitudes en este estado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    {tabla.getHeaderGroups().map((grupo) => (
                      <tr key={grupo.id} className="border-b text-left">
                        {grupo.headers.map((header) => (
                          <th key={header.id} className="py-2 px-3 font-medium text-neutral-700">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {tabla.getRowModel().rows.map((fila) => (
                      <tr key={fila.id} className="border-b last:border-0 hover:bg-neutral-50">
                        {fila.getVisibleCells().map((celda) => (
                          <td key={celda.id} className="py-2 px-3 text-neutral-800">
                            {flexRender(celda.column.columnDef.cell, celda.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={detalle !== null} onOpenChange={(abierto) => !abierto && cerrarDetalle()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogTitle>Detalle de la solicitud</DialogTitle>
          <DialogDescription>
            {detalle &&
              `${detalle.estudiante.usuario.nombres} ${detalle.estudiante.usuario.apellidos} · ${detalle.periodo.codigo}`}
          </DialogDescription>

          <div className="mt-4 space-y-2">
            {cargandoCursos ? (
              <p className="text-sm text-neutral-500">Cargando...</p>
            ) : (
              <>
                {cursos.map((curso) => (
                  <div
                    key={curso.cursoId}
                    className="flex items-center justify-between border rounded-md px-3 py-2"
                  >
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

          {!cargandoCursos && detalle?.estado === 'PENDIENTE' && (
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
                      onClick={() => validar(false)}
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
                  <Button disabled={procesando} onClick={() => validar(true)}>
                    {procesando ? 'Procesando...' : 'Aprobar'}
                  </Button>
                  <Button variant="destructive" disabled={procesando} onClick={() => setRechazando(true)}>
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}

          {!cargandoCursos && detalle?.estado === 'VALIDADA' && (
            <div className="mt-5 border-t pt-4 space-y-3">
              <p className="text-sm font-medium text-neutral-700">Registrar pago</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">Monto (S/.)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">Numero de recibo</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    value={numeroRecibo}
                    onChange={(e) => setNumeroRecibo(e.target.value)}
                    placeholder="REC-001"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Metodo de pago</label>
                <select
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Comprobante (imagen, opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm"
                  onChange={(e) => setComprobante(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button className="w-full" disabled={procesando || !puedePagar} onClick={registrarPago}>
                {procesando ? 'Registrando...' : 'Registrar pago'}
              </Button>
            </div>
          )}

          {!cargandoCursos && (detalle?.estado === 'PAGADA' || detalle?.estado === 'MATRICULADO') && (
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
                    <a
                      href={`${SERVER_ORIGIN}${pago.comprobanteUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
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

              <Button className="w-full" disabled={descargando} onClick={descargarFichaOficial}>
                {descargando
                  ? 'Generando...'
                  : detalle?.estado === 'MATRICULADO'
                    ? 'Descargar ficha oficial'
                    : 'Generar ficha oficial'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
