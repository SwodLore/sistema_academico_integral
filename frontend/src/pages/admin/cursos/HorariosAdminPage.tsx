import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Edit2, Calendar, Clock, MapPin, RefreshCw, AlertCircle, Trash, Plus, Search, CheckCircle2, X } from 'lucide-react'
import { cursosApi, type AsignacionPayload } from '@/api/cursos'
import type { AsignacionConHorarios, HorarioSimplificado } from '@/types'
import { DIA_SEMANA_LABELS, type DiaSemana } from '@/types/horario'

const INITIAL_HORARIO: HorarioSimplificado = {
  dia: 'LUNES',
  horaInicio: '08:00',
  horaFin: '10:00',
  aula: '',
}

const DAY_BADGE_CLASSES: Record<DiaSemana, string> = {
  LUNES: 'bg-blue-50 text-blue-755 border-blue-200 hover:bg-blue-50',
  MARTES: 'bg-amber-50 text-amber-755 border-amber-200 hover:bg-amber-50',
  MIERCOLES: 'bg-emerald-50 text-emerald-755 border-emerald-200 hover:bg-emerald-50',
  JUEVES: 'bg-purple-50 text-purple-755 border-purple-200 hover:bg-purple-50',
  VIERNES: 'bg-rose-50 text-rose-755 border-rose-200 hover:bg-rose-50',
  SABADO: 'bg-indigo-50 text-indigo-755 border-indigo-200 hover:bg-indigo-50',
}

export default function HorariosAdminPage() {
  const [asignaciones, setAsignaciones] = useState<AsignacionConHorarios[]>([])
  const [cargando, setCargando] = useState(true)

  // Filters
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('')
  const [busqueda, setBusqueda] = useState<string>('')

  // Modals state
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalAulaAbierto, setModalAulaAbierto] = useState(false)
  
  const [editando, setEditando] = useState<AsignacionConHorarios | null>(null)
  const [horariosForm, setHorariosForm] = useState<HorarioSimplificado[]>([])
  
  // Specific classroom change form state
  const [aulasForm, setAulasForm] = useState<string[]>([])
  
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [procesando, setProcesando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
  const [exitoMensaje, setExitoMensaje] = useState<string | null>(null)

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
          setFiltroPeriodo(periodos[periodos.length - 1]) // Default to latest period
        }
      }
    } catch (e) {
      console.error('Error al cargar asignaciones y horarios', e)
    } finally {
      setCargando(false)
    }
  }

  function mostrarExito(msg: string) {
    setExitoMensaje(msg)
    setTimeout(() => setExitoMensaje(null), 4000)
  }

  // Opens the general schedules edit modal
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

  // Opens the quick classroom change modal
  function abrirCambiarAula(asig: AsignacionConHorarios) {
    setEditando(asig)
    setAulasForm(asig.horarios.map((h) => h.aula ?? ''))
    setErrores({})
    setErrorGlobal(null)
    setModalAulaAbierto(true)
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
      } else if (h.horaInicio >= h.horaFin) {
        err[`horas_${index}`] = 'La hora de inicio debe ser menor a la hora de fin'
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
      mostrarExito('¡Horarios actualizados correctamente!')
    } catch (e: any) {
      setErrorGlobal(e.response?.data?.message ?? 'Ocurrió un error al guardar los horarios.')
    } finally {
      setProcesando(false)
    }
  }

  async function guardarAulas() {
    if (!editando) return
    
    // Validar que las aulas no estén vacías
    const err: Record<string, string> = {}
    aulasForm.forEach((a, index) => {
      if (!a.trim()) {
        err[`aula_${index}`] = 'El nombre de aula no puede estar vacío'
      }
    })
    if (Object.keys(err).length > 0) {
      setErrores(err)
      return
    }

    setProcesando(true)
    setErrorGlobal(null)
    try {
      const payload: AsignacionPayload = {
        cursoId: editando.curso.id,
        docenteId: editando.docente.id,
        anio: editando.periodo.anio,
        semestre: editando.periodo.semestre,
        seccion: editando.seccion,
        horarios: editando.horarios.map((h, index) => ({
          dia: h.dia,
          horaInicio: h.horaInicio.substring(0, 5),
          horaFin: h.horaFin.substring(0, 5),
          aula: aulasForm[index]?.trim().toUpperCase() || 'AULA-VIRTUAL',
        })),
      }

      await cursosApi.editarAsignacion(editando.id, payload)
      await cargarDatos()
      setModalAulaAbierto(false)
      mostrarExito('¡Aulas modificadas correctamente!')
    } catch (e: any) {
      setErrorGlobal(e.response?.data?.message ?? 'Ocurrió un error al guardar las aulas.')
    } finally {
      setProcesando(false)
    }
  }

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroPeriodo('')
  }

  // Filter calculations
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
    <div className="min-h-screen bg-neutral-50/50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Banner de Éxito */}
        {exitoMensaje && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{exitoMensaje}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">Programación y Horarios</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Visualiza y gestiona las aulas y los horarios semanales de todos los cursos en el semestre académico.
            </p>
          </div>
        </div>

        {/* Controls Card */}
        <Card className="shadow-sm border-neutral-200/80 bg-white">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5 w-full">
                <label className="text-[11px] font-bold text-neutral-550 uppercase tracking-wider">Buscar curso o docente</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Escribe el nombre del curso, código de curso, docente o aula..."
                    className="pl-9 h-10 w-full rounded-lg border border-neutral-300 bg-white text-sm focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-all shadow-sm"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 shrink-0 w-full md:w-auto">
                <label className="text-[11px] font-bold text-neutral-550 uppercase tracking-wider">Semestre académico</label>
                <select
                  className="h-10 w-full md:w-[200px] rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none transition-all shadow-sm font-semibold"
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                >
                  <option value="">Todos los semestres</option>
                  {periodosDisponibles.map((p) => (
                    <option key={p} value={p}>
                      Semestre {p}
                    </option>
                  ))}
                </select>
              </div>

              {(busqueda || filtroPeriodo) && (
                <Button
                  onClick={limpiarFiltros}
                  variant="ghost"
                  className="h-10 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 gap-1.5 px-4 w-full md:w-auto font-medium"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info matches indicator */}
        {(busqueda || filtroPeriodo) && (
          <div className="text-xs font-semibold text-neutral-500 px-1">
            Resultados de búsqueda: Mostrando <span className="text-neutral-900 font-bold">{asignacionesFiltradas.length}</span> de <span className="text-neutral-900 font-bold">{asignaciones.length}</span> asignaciones.
          </div>
        )}

        {/* Table Card */}
        <Card className="shadow-sm border-neutral-200 bg-white overflow-hidden">
          <CardHeader className="border-b border-neutral-100 px-6 py-4">
            <CardTitle className="text-lg font-bold text-neutral-850">Distribución Horaria de Asignaturas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
                <p className="text-sm font-semibold text-neutral-550">Cargando distribución horaria...</p>
              </div>
            ) : asignacionesFiltradas.length === 0 ? (
              <div className="py-20 text-center text-neutral-550 px-4">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-base font-bold text-neutral-700">No se encontraron programaciones</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  Prueba cambiando los filtros o asegúrate de que existan asignaciones de docentes registradas en el periodo actual.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Periodo</th>
                      <th className="px-6 py-3.5">Curso</th>
                      <th className="px-6 py-3.5">Sección</th>
                      <th className="px-6 py-3.5">Docente</th>
                      <th className="px-6 py-3.5">Horarios semanales y Aulas</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm">
                    {asignacionesFiltradas.map((asig) => (
                      <tr key={asig.id} className="hover:bg-neutral-50/50 transition-colors">
                        {/* Periodo */}
                        <td className="px-6 py-4 align-middle font-bold text-neutral-700">
                          {asig.periodo.codigo}
                        </td>
                        
                        {/* Curso */}
                        <td className="px-6 py-4 align-middle">
                          <div className="font-semibold text-neutral-900 hover:text-neutral-700 cursor-default">
                            {asig.curso.nombre}
                          </div>
                          <span className="text-[10px] font-mono bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded text-neutral-600 font-bold mt-1 inline-block">
                            {asig.curso.codigo}
                          </span>
                        </td>
                        
                        {/* Sección */}
                        <td className="px-6 py-4 align-middle">
                          <Badge variant="outline" className="font-extrabold text-[10px] px-2 py-0.5 bg-neutral-50 border-neutral-300 text-neutral-700">
                            Secc. {asig.seccion}
                          </Badge>
                        </td>
                        
                        {/* Docente */}
                        <td className="px-6 py-4 align-middle">
                          <div className="font-semibold text-neutral-800">
                            {asig.docente.usuario.nombres} {asig.docente.usuario.apellidos}
                          </div>
                          <div className="text-xs text-neutral-400 font-mono mt-0.5">{asig.docente.codigoDocente}</div>
                        </td>
                        
                        {/* Horarios */}
                        <td className="px-6 py-4 align-middle max-w-[340px]">
                          <div className="flex flex-col gap-2">
                            {asig.horarios && asig.horarios.length > 0 ? (
                              asig.horarios.map((h, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs border border-neutral-200/80 rounded-md p-1.5 bg-neutral-50/50 hover:bg-neutral-50 transition-all shadow-2xs"
                                >
                                  {/* Day Badge */}
                                  <Badge
                                    variant="outline"
                                    className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase shrink-0 border ${
                                      DAY_BADGE_CLASSES[h.dia] || 'bg-neutral-50 text-neutral-600'
                                    }`}
                                  >
                                    {DIA_SEMANA_LABELS[h.dia].substring(0, 3)}
                                  </Badge>

                                  {/* Hours block */}
                                  <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-700">
                                    <Clock className="w-3 h-3 text-neutral-450 shrink-0" />
                                    {h.horaInicio.substring(0, 5)} - {h.horaFin.substring(0, 5)}
                                  </span>

                                  {/* Classroom Badge */}
                                  <span className="flex items-center gap-0.5 text-[10px] text-neutral-800 font-bold font-mono bg-white border border-neutral-200 px-2 py-0.5 rounded ml-auto shadow-3xs shrink-0">
                                    <MapPin className="w-2.5 h-2.5 text-neutral-500" />
                                    {h.aula || 'S/A'}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> Sin horario
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Acciones */}
                        <td className="px-6 py-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            {/* Quick Classroom change button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirCambiarAula(asig)}
                              className="h-8 text-xs font-semibold hover:bg-neutral-50 text-neutral-600 border-neutral-300 hover:text-neutral-900 gap-1"
                            >
                              <MapPin className="w-3 h-3 text-neutral-500" /> Aula
                            </Button>

                            {/* Full schedule edit button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirEditarHorarios(asig)}
                              className="h-8 text-xs font-semibold text-neutral-850 hover:bg-neutral-55 bg-neutral-900 text-white hover:text-white border-transparent gap-1 shadow-sm"
                            >
                              <Edit2 className="w-3 h-3" /> Editar
                            </Button>
                          </div>
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

      {/* Modal 1: Full Schedule/Hours Edit */}
      <Dialog open={modalAbierto} onOpenChange={(open) => !open && !procesando && setModalAbierto(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-xl shadow-xl border border-neutral-200">
          <div className="flex justify-between items-start pb-2 border-b border-neutral-100">
            <div>
              <DialogTitle className="text-lg font-bold text-neutral-900">Editar Horario Completo</DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 mt-0.5">
                Configura los días, horas y aulas asignadas para este curso. El sistema validará colisiones horarias.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModalAbierto(false)}
              className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 h-6 w-6"
              disabled={procesando}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {editando && (
            <div className="mt-4 bg-neutral-50 border border-neutral-200 p-4 rounded-lg space-y-2 text-xs text-neutral-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-neutral-500 uppercase tracking-wider block text-[9px]">Asignatura</span>
                  <span className="font-semibold text-neutral-900 text-sm">[{editando.curso.codigo}] {editando.curso.nombre}</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-500 uppercase tracking-wider block text-[9px]">Catedrático</span>
                  <span className="font-semibold text-neutral-900 text-sm">{editando.docente.usuario.nombres} {editando.docente.usuario.apellidos}</span>
                </div>
              </div>
              <div className="border-t border-neutral-200/60 pt-2 mt-2 flex justify-between items-center">
                <span className="text-[10px] text-neutral-500 font-medium">Semestre Académico: <strong className="text-neutral-800">{editando.periodo.codigo}</strong></span>
                <span className="text-[10px] text-neutral-500 font-medium">Sección: <strong className="text-neutral-800">{editando.seccion}</strong></span>
              </div>
            </div>
          )}

          {errorGlobal && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
              <span className="font-semibold">{errorGlobal}</span>
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Distribución de Clases</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarHorarioItem}
                disabled={procesando}
                className="h-8 text-xs font-bold gap-1 text-neutral-600 hover:text-neutral-950 border-neutral-300 hover:bg-neutral-50"
              >
                <Plus className="w-3.5 h-3.5 text-neutral-500" /> Añadir Bloque
              </Button>
            </div>

            {errores.horarios && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-150 p-2 rounded font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" /> {errores.horarios}
              </p>
            )}

            <div className="space-y-3.5">
              {horariosForm.map((horario, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-neutral-50/70 border border-neutral-200/80 rounded-lg p-3.5 relative hover:border-neutral-300 transition-colors"
                >
                  {/* Día de la semana */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Día</label>
                    <select
                      className="w-full rounded-md border border-neutral-350 bg-white px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none transition-all shadow-2xs font-medium"
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

                  {/* Hora de Inicio */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Hora Inicio</label>
                    <input
                      type="time"
                      className="w-full rounded-md border border-neutral-350 px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none shadow-2xs font-semibold"
                      value={horario.horaInicio}
                      onChange={(e) => actualizarHorarioItem(index, 'horaInicio', e.target.value)}
                      disabled={procesando}
                    />
                    {errores[`horas_${index}`] && (
                      <p className="text-[10px] text-red-650 font-bold mt-1">{errores[`horas_${index}`]}</p>
                    )}
                  </div>

                  {/* Hora de Fin */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Hora Fin</label>
                    <input
                      type="time"
                      className="w-full rounded-md border border-neutral-350 px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none shadow-2xs font-semibold"
                      value={horario.horaFin}
                      onChange={(e) => actualizarHorarioItem(index, 'horaFin', e.target.value)}
                      disabled={procesando}
                    />
                  </div>

                  {/* Aula */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Aula</label>
                    <input
                      type="text"
                      placeholder="Ej. 101"
                      className="w-full rounded-md border border-neutral-350 px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none font-mono font-bold uppercase shadow-2xs"
                      value={horario.aula}
                      onChange={(e) => actualizarHorarioItem(index, 'aula', e.target.value)}
                      disabled={procesando}
                    />
                    {errores[`aula_${index}`] && (
                      <p className="text-[10px] text-red-600 font-bold mt-1">{errores[`aula_${index}`]}</p>
                    )}
                  </div>

                  {/* Eliminar Bloque */}
                  <div className="sm:col-span-1 text-center pb-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarHorarioItem(index)}
                      disabled={procesando || horariosForm.length === 1}
                      className="h-8 w-8 p-0 text-red-550 border-neutral-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                      title="Eliminar este bloque"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-neutral-100 mt-6">
              <Button
                variant="outline"
                onClick={() => setModalAbierto(false)}
                disabled={procesando}
                className="h-10 text-neutral-600 hover:bg-neutral-100 px-5 text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarHorarios}
                disabled={procesando}
                className="h-10 bg-neutral-900 text-white hover:bg-neutral-950 px-5 text-xs font-semibold shadow-sm"
              >
                {procesando ? 'Procesando...' : 'Guardar Horarios'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Quick Classroom Change */}
      <Dialog open={modalAulaAbierto} onOpenChange={(open) => !open && !procesando && setModalAulaAbierto(false)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-6 bg-white rounded-xl shadow-xl border border-neutral-200">
          <div className="flex justify-between items-start pb-2 border-b border-neutral-100">
            <div>
              <DialogTitle className="text-lg font-bold text-neutral-900">Cambiar Aula de Curso</DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 mt-0.5">
                Cambia de forma rápida el aula física de los bloques del curso. Se verificará disponibilidad de las aulas.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModalAulaAbierto(false)}
              className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 h-6 w-6"
              disabled={procesando}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {editando && (
            <div className="mt-4 bg-neutral-50 border border-neutral-200 p-3.5 rounded-lg space-y-1 text-xs text-neutral-700">
              <div>
                <span className="font-bold text-neutral-500 block text-[9px] uppercase tracking-wider">Asignatura</span>
                <span className="font-semibold text-neutral-900">{editando.curso.nombre}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-neutral-200/60">
                <div>
                  <span className="font-bold text-neutral-550 block text-[9px] uppercase tracking-wider">Sección</span>
                  <span className="font-semibold text-neutral-800">Sección {editando.seccion}</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-550 block text-[9px] uppercase tracking-wider">Docente</span>
                  <span className="font-semibold text-neutral-800 text-ellipsis truncate block">{editando.docente.usuario.apellidos}</span>
                </div>
              </div>
            </div>
          )}

          {errorGlobal && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-semibold text-left">{errorGlobal}</span>
            </div>
          )}

          <div className="mt-5 space-y-4">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Asignación de Aulas por Bloque</h3>

            <div className="space-y-3.5">
              {editando && editando.horarios.map((horario, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 bg-neutral-50 border border-neutral-200 rounded-lg p-3"
                >
                  <div className="flex justify-between items-center">
                    {/* Day & time range label */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`px-1.5 py-0.5 text-[9px] font-extrabold ${DAY_BADGE_CLASSES[horario.dia]}`}>
                        {DIA_SEMANA_LABELS[horario.dia]}
                      </Badge>
                      <span className="text-[11px] font-semibold text-neutral-600 font-mono">
                        {horario.horaInicio.substring(0, 5)} - {horario.horaFin.substring(0, 5)}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Bloque #{index + 1}</span>
                  </div>

                  <div className="space-y-1 mt-1">
                    <label className="text-[10px] font-bold text-neutral-550 uppercase tracking-wider block">Aula Asignada</label>
                    <input
                      type="text"
                      placeholder="Ej. AULA-101"
                      className="w-full rounded-md border border-neutral-350 bg-white px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none font-mono font-bold uppercase shadow-3xs"
                      value={aulasForm[index] ?? ''}
                      onChange={(e) => {
                        const newAulas = [...aulasForm]
                        newAulas[index] = e.target.value
                        setAulasForm(newAulas)
                        
                        // Clear error on edit
                        if (errores[`aula_${index}`]) {
                          const newErrors = { ...errores }
                          delete newErrors[`aula_${index}`]
                          setErrores(newErrors)
                        }
                      }}
                      disabled={procesando}
                    />
                    {errores[`aula_${index}`] && (
                      <p className="text-[10px] text-red-650 font-bold mt-1">{errores[`aula_${index}`]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-neutral-100 mt-5">
              <Button
                variant="outline"
                onClick={() => setModalAulaAbierto(false)}
                disabled={procesando}
                className="h-10 text-neutral-600 hover:bg-neutral-100 px-5 text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarAulas}
                disabled={procesando}
                className="h-10 bg-neutral-900 text-white hover:bg-neutral-950 px-5 text-xs font-semibold shadow-sm"
              >
                {procesando ? 'Guardando...' : 'Actualizar Aulas'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
