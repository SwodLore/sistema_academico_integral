import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Edit2, Calendar, Clock, MapPin, RefreshCw, AlertCircle, Trash, Plus, Search } from 'lucide-react'
import { cursosApi, type AsignacionPayload } from '@/api/cursos'
import type { AsignacionConHorarios, HorarioSimplificado } from '@/types'
import { DIA_SEMANA_LABELS } from '@/types/horario'

const INITIAL_HORARIO: HorarioSimplificado = {
  dia: 'LUNES',
  horaInicio: '08:00',
  horaFin: '10:00',
  aula: '',
}

export default function HorariosAdminPage() {
  const [asignaciones, setAsignaciones] = useState<AsignacionConHorarios[]>([])
  const [cargando, setCargando] = useState(true)

  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('')
  const [busqueda, setBusqueda] = useState<string>('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<AsignacionConHorarios | null>(null)
  const [horariosForm, setHorariosForm] = useState<HorarioSimplificado[]>([])
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [procesando, setProcesando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const listadoAsignaciones = await cursosApi.listarAsignaciones()
      setAsignaciones(listadoAsignaciones)

      if (listadoAsignaciones.length > 0) {
        const periodos = Array.from(new Set(listadoAsignaciones.map((a) => a.periodo.codigo))).sort()
        if (periodos.length > 0 && !filtroPeriodo) {
          setFiltroPeriodo(periodos[periodos.length - 1])
        }
      }
    } catch (e) {
      console.error('Error al cargar asignaciones y horarios', e)
    } finally {
      setCargando(false)
    }
  }

  function abrirEditarHorarios(asig: AsignacionConHorarios) {
    setEditando(asig)
    setHorariosForm(
      asig.horarios.map((h) => ({
        dia: h.dia,
        horaInicio: h.horaInicio.substring(0, 5),
        horaFin: h.horaFin.substring(0, 5),
        aula: h.aula ?? '',
      }))
    )
    setErrores({})
    setErrorGlobal(null)
    setModalAbierto(true)
  }

  function agregarHorarioItem() {
    setHorariosForm((prev) => [...prev, { ...INITIAL_HORARIO }])
  }

  function eliminarHorarioItem(index: number) {
    setHorariosForm((prev) => prev.filter((_, i) => i !== index))
  }

  function actualizarHorarioItem(index: number, campo: keyof HorarioSimplificado, valor: string) {
    setHorariosForm((prev) => {
      const actualizados = [...prev]
      actualizados[index] = { ...actualizados[index], [campo]: valor }
      return actualizados
    })
  }

  function validar(): boolean {
    const err: Record<string, string> = {}
    if (horariosForm.length === 0) {
      err.horarios = 'Debe definir al menos un bloque de horario para el curso'
    }

    horariosForm.forEach((h, index) => {
      if (!h.aula?.trim()) {
        err[`aula_${index}`] = 'El aula es obligatoria'
      }
      if (!h.horaInicio || !h.horaFin) {
        err[`horas_${index}`] = 'Las horas de inicio y fin son obligatorias'
      }
    })

    setErrores(err)
    return Object.keys(err).length === 0
  }

  async function guardarHorarios() {
    if (!editando || !validar()) return
    setProcesando(true)
    setErrorGlobal(null)
    try {
      const payload: AsignacionPayload = {
        cursoId: editando.curso.id,
        docenteId: editando.docente.id,
        anio: editando.periodo.anio,
        semestre: editando.periodo.semestre,
        seccion: editando.seccion,
        horarios: horariosForm.map((h) => ({
          ...h,
          aula: h.aula?.trim().toUpperCase() || 'AULA-VIRTUAL',
        })),
      }

      await cursosApi.editarAsignacion(editando.id, payload)
      await cargarDatos()
      setModalAbierto(false)
    } catch (e: any) {
      setErrorGlobal(e.response?.data?.message ?? 'Ocurrió un error al guardar los horarios.')
    } finally {
      setProcesando(false)
    }
  }

  const periodosDisponibles = Array.from(new Set(asignaciones.map((a) => a.periodo.codigo))).sort()

  const asignacionesFiltradas = asignaciones.filter((a) => {
    const matchesPeriodo = !filtroPeriodo || a.periodo.codigo === filtroPeriodo

    const query = busqueda.toLowerCase().trim()
    const matchesBusqueda =
      !query ||
      a.curso.nombre.toLowerCase().includes(query) ||
      a.curso.codigo.toLowerCase().includes(query) ||
      a.docente.usuario.nombres.toLowerCase().includes(query) ||
      a.docente.usuario.apellidos.toLowerCase().includes(query) ||
      (a.horarios && a.horarios.some(h => h.aula?.toLowerCase().includes(query)))

    return matchesPeriodo && matchesBusqueda
  })

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Programación y Horarios</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Visualiza, edita y gestiona las aulas y los horarios semanales de todos los cursos en el semestre académico.
          </p>
        </div>

        {/* Controls Card */}
        <Card className="shadow-sm border-neutral-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">Filtros de Búsqueda</CardTitle>
            <CardDescription>Filtra por periodo académico o busca por curso, docente o aula.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar por curso, código, docente o aula..."
                  className="pl-9 h-10 w-full rounded-md border border-neutral-300 bg-white text-sm focus:border-neutral-500 focus:outline-none transition-colors"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Semestre:</span>
                <select
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-neutral-500 focus:outline-none min-w-[150px]"
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                >
                  <option value="">Todos los semestres</option>
                  {periodosDisponibles.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card className="shadow-sm border-neutral-200">
          <CardHeader className="border-b border-neutral-100">
            <CardTitle className="text-lg font-bold">Distribución de Horarios ({asignacionesFiltradas.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
                <p className="text-sm text-neutral-500">Cargando programación de clases...</p>
              </div>
            ) : asignacionesFiltradas.length === 0 ? (
              <div className="py-20 text-center text-neutral-500">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-base font-medium">No se encontraron cursos programados</p>
                <p className="text-xs text-neutral-400 mt-1">Prueba cambiando los filtros o asigna un docente a un curso primero.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Periodo</th>
                      <th className="px-6 py-3">Curso & Código</th>
                      <th className="px-6 py-3">Sección</th>
                      <th className="px-6 py-3">Docente Asignado</th>
                      <th className="px-6 py-3">Horario y Aula Semanal</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm">
                    {asignacionesFiltradas.map((asig) => (
                      <tr key={asig.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-neutral-700">{asig.periodo.codigo}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-900">{asig.curso.nombre}</div>
                          <span className="text-[10px] font-mono bg-neutral-150 px-1.5 py-0.5 rounded text-neutral-600 font-semibold mt-1 inline-block">
                            {asig.curso.codigo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-extrabold text-[10px] px-2 py-0.5">
                            Secc. {asig.seccion}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-800">
                            {asig.docente.usuario.nombres} {asig.docente.usuario.apellidos}
                          </div>
                          <div className="text-xs text-neutral-400 mt-0.5">{asig.docente.gradoAcademico}</div>
                        </td>
                        <td className="px-6 py-4 max-w-[350px]">
                          <div className="space-y-1.5">
                            {asig.horarios && asig.horarios.length > 0 ? (
                              asig.horarios.map((h, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 bg-neutral-100/60 border border-neutral-200/80 rounded px-2.5 py-1.5"
                                >
                                  <span className="font-bold text-neutral-800">{DIA_SEMANA_LABELS[h.dia]}:</span>
                                  <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-700">
                                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                    {h.horaInicio.substring(0, 5)} - {h.horaFin.substring(0, 5)}
                                  </span>
                                  <span className="flex items-center gap-0.5 text-[11px] text-neutral-600 font-mono bg-white border border-neutral-200 rounded px-1.5 py-0.5 ml-auto">
                                    <MapPin className="w-3 h-3 text-neutral-400" />
                                    {h.aula || 'No definida'}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-red-500 font-medium">Sin horarios configurados</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirEditarHorarios(asig)}
                            className="h-8 gap-1.5 text-xs text-neutral-750 hover:text-neutral-900 border-neutral-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Editar Horario
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Dialog open={modalAbierto} onOpenChange={(open) => !open && !procesando && setModalAbierto(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-bold">Gestionar Horarios de Clase</DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            Define la programación de días, horas y aulas para el curso. Se verificarán cruces de aulas y de disponibilidad docente.
          </DialogDescription>

          {editando && (
            <div className="mt-3 bg-neutral-100/80 border border-neutral-200 p-4 rounded-lg space-y-2 text-sm text-neutral-750">
              <div className="flex justify-between border-b border-neutral-200 pb-1.5">
                <span className="font-semibold text-neutral-900">Curso:</span>
                <span>[{editando.curso.codigo}] {editando.curso.nombre}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1.5">
                <span className="font-semibold text-neutral-900">Docente:</span>
                <span>{editando.docente.usuario.nombres} {editando.docente.usuario.apellidos}</span>
              </div>
              <div className="flex justify-between pb-0.5">
                <span className="font-semibold text-neutral-900">Periodo / Sección:</span>
                <span>Semestre {editando.periodo.codigo} — Sección {editando.seccion}</span>
              </div>
            </div>
          )}

          {errorGlobal && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorGlobal}</span>
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Bloques de Horario</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarHorarioItem}
                disabled={procesando}
                className="h-8 text-xs gap-1 text-neutral-600 hover:text-neutral-900"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar bloque
              </Button>
            </div>

            {errores.horarios && <p className="text-xs text-red-650 font-bold">{errores.horarios}</p>}

            <div className="space-y-3">
              {horariosForm.map((horario, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-neutral-50 border border-neutral-200 rounded-lg p-4 relative"
                >
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Día</label>
                    <select
                      className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs focus:border-neutral-500 focus:outline-none"
                      value={horario.dia}
                      onChange={(e) => actualizarHorarioItem(index, 'dia', e.target.value as any)}
                      disabled={procesando}
                    >
                      {Object.keys(DIA_SEMANA_LABELS).map((d) => (
                        <option key={d} value={d}>
                          {DIA_SEMANA_LABELS[d as keyof typeof DIA_SEMANA_LABELS]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Inicio</label>
                    <input
                      type="time"
                      className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs focus:border-neutral-500 focus:outline-none"
                      value={horario.horaInicio}
                      onChange={(e) => actualizarHorarioItem(index, 'horaInicio', e.target.value)}
                      disabled={procesando}
                    />
                    {errores[`horas_${index}`] && <p className="text-[10px] text-red-600 font-medium">{errores[`horas_${index}`]}</p>}
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Fin</label>
                    <input
                      type="time"
                      className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs focus:border-neutral-500 focus:outline-none"
                      value={horario.horaFin}
                      onChange={(e) => actualizarHorarioItem(index, 'horaFin', e.target.value)}
                      disabled={procesando}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Aula</label>
                    <input
                      type="text"
                      placeholder="Ej. 101"
                      className="w-full rounded-md border border-neutral-300 px-2.5 py-1 text-xs focus:border-neutral-500 focus:outline-none font-mono uppercase"
                      value={horario.aula}
                      onChange={(e) => actualizarHorarioItem(index, 'aula', e.target.value)}
                      disabled={procesando}
                    />
                    {errores[`aula_${index}`] && <p className="text-[10px] text-red-650 font-medium">{errores[`aula_${index}`]}</p>}
                  </div>

                  <div className="sm:col-span-1 text-center pb-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarHorarioItem(index)}
                      disabled={procesando || horariosForm.length === 1}
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 border-neutral-250"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
              <Button
                variant="outline"
                onClick={() => setModalAbierto(false)}
                disabled={procesando}
                className="h-10 text-neutral-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarHorarios}
                disabled={procesando}
                className="h-10 bg-neutral-900 text-white hover:bg-neutral-850"
              >
                {procesando ? 'Guardando...' : 'Guardar Horarios'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
