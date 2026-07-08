import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, RefreshCw, AlertCircle, Trash } from 'lucide-react'
import { cursosApi, type AsignacionPayload } from '@/api/cursos'
import type { Curso, Docente, AsignacionConHorarios, HorarioSimplificado } from '@/types'
import { DIA_SEMANA_LABELS } from '@/types/horario'

const INITIAL_HORARIO: HorarioSimplificado = {
  dia: 'LUNES',
  horaInicio: '08:00',
  horaFin: '10:00',
  aula: '',
}

const INITIAL_FORM = {
  cursoId: 0,
  docenteId: 0,
  anio: new Date().getFullYear(),
  semestre: 'I',
  seccion: 'A',
  horarios: [] as HorarioSimplificado[],
}

export default function AsignacionesDocentesPage() {
  const [asignaciones, setAsignaciones] = useState<AsignacionConHorarios[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [cargando, setCargando] = useState(true)

  // Filters
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('')
  
  // Dialog State
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<AsignacionConHorarios | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [procesando, setProcesando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const [listadoAsignaciones, listadoCursos, listadoDocentes] = await Promise.all([
        cursosApi.listarAsignaciones(),
        cursosApi.listar(),
        cursosApi.listarDocentes(),
      ])
      setAsignaciones(listadoAsignaciones)
      setCursos(listadoCursos)
      setDocentes(listadoDocentes)
    } catch (e) {
      console.error('Error al cargar asignaciones', e)
    } finally {
      setCargando(false)
    }
  }

  function abrirNueva() {
    setEditando(null)
    setForm({
      cursoId: cursos[0]?.id ?? 0,
      docenteId: docentes[0]?.id ?? 0,
      anio: new Date().getFullYear(),
      semestre: 'I',
      seccion: 'A',
      horarios: [{ ...INITIAL_HORARIO }],
    })
    setErrores({})
    setErrorGlobal(null)
    setModalAbierto(true)
  }

  function abrirEditar(asig: AsignacionConHorarios) {
    setEditando(asig)
    setForm({
      cursoId: asig.curso.id,
      docenteId: asig.docente.id,
      anio: asig.periodo.anio,
      semestre: asig.periodo.semestre,
      seccion: asig.seccion,
      horarios: asig.horarios.map((h) => ({
        dia: h.dia,
        horaInicio: h.horaInicio.substring(0, 5), // Normalizar a "HH:mm" si viene como "HH:mm:ss"
        horaFin: h.horaFin.substring(0, 5),
        aula: h.aula ?? '',
      })),
    })
    setErrores({})
    setErrorGlobal(null)
    setModalAbierto(true)
  }

  function actualizarCampo(campo: string, valor: any) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function agregarHorarioItem() {
    setForm((prev) => ({
      ...prev,
      horarios: [...prev.horarios, { ...INITIAL_HORARIO }],
    }))
  }

  function eliminarHorarioItem(index: number) {
    setForm((prev) => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index),
    }))
  }

  function actualizarHorarioItem(index: number, campo: keyof HorarioSimplificado, valor: string) {
    setForm((prev) => {
      const actualizados = [...prev.horarios]
      actualizados[index] = { ...actualizados[index], [campo]: valor }
      return { ...prev, horarios: actualizados }
    })
  }

  function validar(): boolean {
    const err: Record<string, string> = {}
    if (!form.cursoId) err.cursoId = 'Debe seleccionar un curso'
    if (!form.docenteId) err.docenteId = 'Debe seleccionar un docente'
    if (!form.seccion.trim()) err.seccion = 'La sección es obligatoria'
    if (!form.anio || form.anio < 2000) err.anio = 'Año inválido'
    if (form.horarios.length === 0) {
      err.horarios = 'Debes definir al menos un bloque de horario'
    }

    setErrores(err)
    return Object.keys(err).length === 0
  }

  async function guardar() {
    if (!validar()) return
    setProcesando(true)
    setErrorGlobal(null)
    try {
      const payload: AsignacionPayload = {
        cursoId: form.cursoId,
        docenteId: form.docenteId,
        anio: form.anio,
        semestre: form.semestre,
        seccion: form.seccion.toUpperCase(),
        horarios: form.horarios.map(h => ({
          ...h,
          aula: h.aula?.trim() || 'AULA-VIRTUAL'
        }))
      }

      if (editando) {
        await cursosApi.editarAsignacion(editando.id, payload)
      } else {
        await cursosApi.crearAsignacion(payload)
      }
      await cargarDatos()
      setModalAbierto(false)
    } catch (e: any) {
      setErrorGlobal(e.response?.data?.message ?? 'Ocurrió un error al guardar la asignación.')
    } finally {
      setProcesando(false)
    }
  }

  async function eliminarAsignacion(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta asignación docente? Se eliminarán también todos sus horarios registrados.')) return
    try {
      await cursosApi.eliminarAsignacion(id)
      await cargarDatos()
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'No se pudo eliminar la asignación.')
    }
  }

  // Obtener periodos únicos de las asignaciones para filtrar
  const periodosDisponibles = Array.from(new Set(asignaciones.map((a) => a.periodo.codigo))).sort()

  const asignacionesFiltradas = asignaciones.filter((a) => {
    if (!filtroPeriodo) return true
    return a.periodo.codigo === filtroPeriodo
  })

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Asignación de Docentes</h1>
            <p className="text-sm text-neutral-500 mt-1">Organiza el semestre académico asignando docentes y configurando sus horarios de clases sin cruces</p>
          </div>
          <Button onClick={abrirNueva} className="bg-neutral-900 text-white hover:bg-neutral-850 gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Asignar Docente
          </Button>
        </div>

        <Card className="shadow-sm border-neutral-200">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Asignaciones de Carga Académica</CardTitle>
                <CardDescription>Cursos asignados, docentes y sus respectivos horarios</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Semestre Académico:</span>
                <select
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-neutral-500 focus:outline-none"
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                >
                  <option value="">Todos los semestres</option>
                  {periodosDisponibles.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
                <p className="text-sm text-neutral-500">Cargando asignaciones...</p>
              </div>
            ) : asignacionesFiltradas.length === 0 ? (
              <div className="py-20 text-center text-neutral-500">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-base font-medium">No hay docentes asignados</p>
                <p className="text-xs text-neutral-400 mt-1">Crea una nueva asignación docente para organizar el semestre</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Periodo</th>
                      <th className="px-6 py-3">Curso / Secc.</th>
                      <th className="px-6 py-3">Docente</th>
                      <th className="px-6 py-3">Horario Semanal</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm">
                    {asignacionesFiltradas.map((asig) => (
                      <tr key={asig.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-neutral-800">
                          {asig.periodo.codigo}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-900">{asig.curso.nombre}</div>
                          <div className="flex gap-2 items-center mt-1">
                            <span className="text-[10px] font-mono bg-neutral-150 px-1.5 py-0.5 rounded text-neutral-600 font-semibold">
                              {asig.curso.codigo}
                            </span>
                            <Badge variant="outline" className="font-extrabold text-[9px] px-1.5 py-0">
                              Secc. {asig.seccion}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-800">
                            {asig.docente.usuario.nombres} {asig.docente.usuario.apellidos}
                          </div>
                          <div className="text-xs text-neutral-400 font-mono mt-0.5">
                            {asig.docente.codigoDocente} • {asig.docente.usuario.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[320px]">
                          <div className="space-y-1.5">
                            {asig.horarios.map((h, index) => (
                              <div key={index} className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100/50 border border-neutral-200/60 rounded px-2 py-1">
                                <span className="font-bold text-neutral-700">{DIA_SEMANA_LABELS[h.dia]}:</span>
                                <span className="flex items-center gap-1 text-[11px] font-medium">
                                  <Clock className="w-3 h-3 text-neutral-400" />
                                  {h.horaInicio.substring(0, 5)} - {h.horaFin.substring(0, 5)}
                                </span>
                                {h.aula && (
                                  <span className="flex items-center gap-0.5 text-[11px] text-neutral-500 font-mono bg-white border border-neutral-200 rounded px-1 ml-auto">
                                    <MapPin className="w-2.5 h-2.5 text-neutral-400" />
                                    {h.aula}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirEditar(asig)}
                              className="h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => eliminarAsignacion(asig.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-150"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      <Dialog open={modalAbierto} onOpenChange={(a) => !a && !procesando && setModalAbierto(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-bold">
            {editando ? 'Editar Asignación Docente' : 'Asignar Docente a Curso'}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            Selecciona el curso, docente, y define los horarios y aula. Se comprobarán cruces de horario.
          </DialogDescription>

          {errorGlobal && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorGlobal}</span>
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Curso</label>
                <select
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                  value={form.cursoId}
                  onChange={(e) => actualizarCampo('cursoId', Number(e.target.value))}
                  disabled={procesando}
                >
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>[{c.codigo}] {c.nombre}</option>
                  ))}
                </select>
                {errores.cursoId && <p className="text-[11px] text-red-600 font-medium">{errores.cursoId}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Docente</label>
                <select
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                  value={form.docenteId}
                  onChange={(e) => actualizarCampo('docenteId', Number(e.target.value))}
                  disabled={procesando}
                >
                  {docentes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.usuario.nombres} {d.usuario.apellidos} ({d.gradoAcademico})
                    </option>
                  ))}
                </select>
                {errores.docenteId && <p className="text-[11px] text-red-600 font-medium">{errores.docenteId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Año</label>
                <input
                  type="number"
                  min={2000}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none font-semibold"
                  value={form.anio}
                  onChange={(e) => actualizarCampo('anio', e.target.value ? Number(e.target.value) : new Date().getFullYear())}
                  disabled={procesando}
                />
                {errores.anio && <p className="text-[11px] text-red-600 font-medium">{errores.anio}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Semestre</label>
                <select
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none font-semibold"
                  value={form.semestre}
                  onChange={(e) => actualizarCampo('semestre', e.target.value)}
                  disabled={procesando}
                >
                  <option value="I">I</option>
                  <option value="II">II</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Sección</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="Ej. A"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none font-bold uppercase"
                  value={form.seccion}
                  onChange={(e) => actualizarCampo('seccion', e.target.value)}
                  disabled={procesando}
                />
                {errores.seccion && <p className="text-[11px] text-red-600 font-medium">{errores.seccion}</p>}
              </div>
            </div>

            {/* Horarios List */}
            <div className="border-t border-neutral-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Horarios de Dictado</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={agregarHorarioItem}
                  disabled={procesando}
                  className="h-8 text-xs gap-1 text-neutral-600 hover:text-neutral-900"
                >
                  <Plus className="w-3 h-3" /> Agregar bloque
                </Button>
              </div>

              {errores.horarios && <p className="text-[11px] text-red-650 font-bold">{errores.horarios}</p>}

              <div className="space-y-3">
                {form.horarios.map((horario, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-neutral-50 border border-neutral-200 rounded-md p-3 relative">
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Día</label>
                      <select
                        className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs focus:border-neutral-500 focus:outline-none"
                        value={horario.dia}
                        onChange={(e) => actualizarHorarioItem(index, 'dia', e.target.value as any)}
                        disabled={procesando}
                      >
                        {Object.keys(DIA_SEMANA_LABELS).map((d) => (
                          <option key={d} value={d}>{DIA_SEMANA_LABELS[d as keyof typeof DIA_SEMANA_LABELS]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Inicio</label>
                      <input
                        type="time"
                        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-neutral-500 focus:outline-none"
                        value={horario.horaInicio}
                        onChange={(e) => actualizarHorarioItem(index, 'horaInicio', e.target.value)}
                        disabled={procesando}
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Fin</label>
                      <input
                        type="time"
                        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-neutral-500 focus:outline-none"
                        value={horario.horaFin}
                        onChange={(e) => actualizarHorarioItem(index, 'horaFin', e.target.value)}
                        disabled={procesando}
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Aula</label>
                      <input
                        type="text"
                        placeholder="101"
                        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-neutral-500 focus:outline-none font-mono"
                        value={horario.aula}
                        onChange={(e) => actualizarHorarioItem(index, 'aula', e.target.value)}
                        disabled={procesando}
                      />
                    </div>

                    <div className="sm:col-span-1 text-center pb-0.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarHorarioItem(index)}
                        disabled={procesando || form.horarios.length === 1}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 border-neutral-250"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                onClick={guardar}
                disabled={procesando}
                className="h-10 bg-neutral-900 text-white hover:bg-neutral-850"
              >
                {procesando ? 'Procesando...' : 'Asignar Docente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
