import { useEffect, useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { Matricula } from '@/types'

interface CursoDetalle {
  cursoId: number
  codigo: string
  nombre: string
  creditos: number
  docente: string
  seccion: string
  horarios: string[]
}

function getMensajeError(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } }
  return error.response?.data?.message ?? 'Ocurrio un error, intenta de nuevo'
}

const columnHelper = createColumnHelper<Matricula>()

export default function AdminPage() {
  const [cargando, setCargando] = useState(true)
  const [solicitudes, setSolicitudes] = useState<Matricula[]>([])
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('')
  const [detalle, setDetalle] = useState<Matricula | null>(null)
  const [cursos, setCursos] = useState<CursoDetalle[]>([])
  const [cargandoCursos, setCargandoCursos] = useState(false)

  async function cargar() {
    setCargando(true)
    try {
      const res = await api.get<Matricula[]>('/matriculas', {
        params: { estado: 'PENDIENTE' },
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
  }, [])

  const especialidades = useMemo(
    () => [...new Set(solicitudes.map((s) => s.estudiante.especialidad.nombre))],
    [solicitudes]
  )
  const periodos = useMemo(
    () => [...new Set(solicitudes.map((s) => s.periodo.codigo))],
    [solicitudes]
  )

  const filtradas = useMemo(
    () =>
      solicitudes
        .filter((s) => !filtroEspecialidad || s.estudiante.especialidad.nombre === filtroEspecialidad)
        .filter((s) => !filtroPeriodo || s.periodo.codigo === filtroPeriodo),
    [solicitudes, filtroEspecialidad, filtroPeriodo]
  )

  async function verCursos(solicitud: Matricula) {
    setDetalle(solicitud)
    setCargandoCursos(true)
    try {
      const res = await api.get<CursoDetalle[]>(`/matriculas/${solicitud.id}/cursos`)
      setCursos(res.data)
    } catch (err) {
      toast.error(getMensajeError(err))
      setDetalle(null)
    } finally {
      setCargandoCursos(false)
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
      columnHelper.accessor((m) => m.fechaSolicitud, {
        id: 'fecha',
        header: 'Fecha de solicitud',
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <Button size="sm" variant="outline" onClick={() => verCursos(row.original)}>
            Ver cursos
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

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Solicitudes de Matricula</h1>
          <p className="text-sm text-neutral-500">Solicitudes pendientes de validacion</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Pendientes ({filtradas.length})</CardTitle>
                <CardDescription>Ordenadas de la mas antigua a la mas reciente</CardDescription>
              </div>
              <div className="flex gap-3">
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
                <select
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                >
                  <option value="">Todos los periodos</option>
                  {periodos.map((p) => (
                    <option key={p} value={p}>{p}</option>
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
                No hay solicitudes pendientes.
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

      <Dialog open={detalle !== null} onOpenChange={(abierto) => !abierto && setDetalle(null)}>
        <DialogContent>
          <DialogTitle>Cursos de la solicitud</DialogTitle>
          <DialogDescription>
            {detalle &&
              `${detalle.estudiante.usuario.nombres} ${detalle.estudiante.usuario.apellidos} · ${detalle.periodo.codigo}`}
          </DialogDescription>

          <div className="mt-4 space-y-2">
            {cargandoCursos ? (
              <p className="text-sm text-neutral-500">Cargando cursos...</p>
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
