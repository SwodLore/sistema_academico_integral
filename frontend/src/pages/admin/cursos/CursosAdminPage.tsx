import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, BookOpen, RefreshCw, AlertCircle } from 'lucide-react'
import { catalogosApi } from '@/api/catalogos'
import { cursosApi, type CursoPayload } from '@/api/cursos'
import type { Curso, Especialidad } from '@/types'

const INITIAL_FORM: CursoPayload = {
  codigo: '',
  nombre: '',
  creditos: 4,
  horasSemanales: 4,
  ciclo: 1,
  especialidadId: 0,
  prerequisitoId: null,
}

export default function CursosAdminPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>('')
  
  // Dialog state
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Curso | null>(null)
  const [form, setForm] = useState<CursoPayload>(INITIAL_FORM)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [procesando, setProcesando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const [listadoCursos, listadoEspecialidades] = await Promise.all([
        cursosApi.listar(),
        catalogosApi.especialidades()
      ])
      setCursos(listadoCursos)
      setEspecialidades(listadoEspecialidades)
    } catch (e) {
      console.error('Error al cargar datos', e)
    } finally {
      setCargando(false)
    }
  }

  function abrirNuevo() {
    setEditando(null)
    setForm({
      ...INITIAL_FORM,
      especialidadId: especialidades[0]?.id ?? 0
    })
    setErrores({})
    setErrorGlobal(null)
    setModalAbierto(true)
  }

  function abrirEditar(curso: Curso) {
    setEditando(curso)
    setForm({
      codigo: curso.codigo,
      nombre: curso.nombre,
      creditos: curso.creditos,
      horasSemanales: curso.horasSemanales,
      ciclo: curso.ciclo,
      especialidadId: curso.especialidad.id,
      prerequisitoId: curso.prerequisito?.id ?? null,
    })
    setErrores({})
    setErrorGlobal(null)
    setModalAbierto(true)
  }

  function actualizar<K extends keyof CursoPayload>(campo: K, valor: CursoPayload[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function validar(): boolean {
    const err: Record<string, string> = {}
    if (!form.codigo.trim()) err.codigo = 'El código es obligatorio'
    if (!form.nombre.trim()) err.nombre = 'El nombre es obligatorio'
    if (!form.creditos || form.creditos < 1) err.creditos = 'Debe ser al menos 1 crédito'
    if (!form.horasSemanales || form.horasSemanales < 1) err.horasSemanales = 'Debe ser al menos 1 hora'
    if (!form.ciclo || form.ciclo < 1) err.ciclo = 'Debe ser al menos ciclo 1'
    if (!form.especialidadId) err.especialidadId = 'Debes seleccionar una especialidad'
    
    setErrores(err)
    return Object.keys(err).length === 0
  }

  async function guardar() {
    if (!validar()) return
    setProcesando(true)
    setErrorGlobal(null)
    try {
      if (editando) {
        await cursosApi.editar(editando.id, form)
      } else {
        await cursosApi.crear(form)
      }
      await cargarDatos()
      setModalAbierto(false)
    } catch (e: any) {
      setErrorGlobal(e.response?.data?.message ?? 'Ocurrió un error al guardar el curso.')
    } finally {
      setProcesando(false)
    }
  }

  async function eliminar(id: number) {
    if (!confirm('¿Estás seguro de eliminar este curso del plan de estudios?')) return
    try {
      await cursosApi.eliminar(id)
      await cargarDatos()
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'No se pudo eliminar el curso.')
    }
  }

  const cursosFiltrados = cursos.filter((c) => {
    if (!filtroEspecialidad) return true
    return c.especialidad.id === Number(filtroEspecialidad)
  })

  // Prerrequisitos viables (excluyendo el curso actual si se edita)
  const prerrequisitosViables = cursos.filter((c) => {
    if (!editando) return true
    return c.id !== editando.id
  })

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Mantenimiento de Cursos</h1>
            <p className="text-sm text-neutral-500 mt-1">Crea y edita los cursos del plan de estudios para la asignación académica</p>
          </div>
          <Button onClick={abrirNuevo} className="bg-neutral-900 text-white hover:bg-neutral-850 gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Nuevo Curso
          </Button>
        </div>

        <Card className="shadow-sm border-neutral-200">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Listado ({cursosFiltrados.length})</CardTitle>
                <CardDescription>Cursos registrados organizados por ciclo académico</CardDescription>
              </div>
              <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center">
                <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Especialidad:</span>
                <select
                  className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-neutral-500 focus:outline-none sm:w-[280px]"
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                >
                  <option value="">Todas las especialidades</option>
                  {especialidades.map((esp) => (
                    <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
                <p className="text-sm text-neutral-500">Cargando catálogo de cursos...</p>
              </div>
            ) : cursosFiltrados.length === 0 ? (
              <div className="py-20 text-center text-neutral-500">
                <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-base font-medium">No se encontraron cursos</p>
                <p className="text-xs text-neutral-400 mt-1">Intenta seleccionar otra especialidad o crea un nuevo curso</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Código</th>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Ciclo</th>
                      <th className="px-6 py-3 text-center">Créditos</th>
                      <th className="px-6 py-3 text-center">Horas</th>
                      <th className="px-6 py-3">Especialidad</th>
                      <th className="px-6 py-3">Prerrequisito</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm">
                    {cursosFiltrados.map((curso) => (
                      <tr key={curso.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-neutral-800 text-xs">
                          {curso.codigo}
                        </td>
                        <td className="px-6 py-4 font-semibold text-neutral-900">
                          {curso.nombre}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="info" className="font-bold text-[10px]">
                            Ciclo {curso.ciclo}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center font-medium">
                          {curso.creditos}
                        </td>
                        <td className="px-6 py-4 text-center text-neutral-500">
                          {curso.horasSemanales} hrs
                        </td>
                        <td className="px-6 py-4 text-neutral-600 max-w-[200px] truncate" title={curso.especialidad.nombre}>
                          {curso.especialidad.nombre}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 text-xs">
                          {curso.prerequisito ? (
                            <span className="font-mono bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200">
                              {curso.prerequisito.codigo}
                            </span>
                          ) : (
                            <span className="text-neutral-350 italic">Ninguno</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirEditar(curso)}
                              className="h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => eliminar(curso.id)}
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
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogTitle className="text-xl font-bold">
            {editando ? 'Editar Curso' : 'Registrar Nuevo Curso'}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            Define los datos del curso para el plan curricular antes de asignar un docente.
          </DialogDescription>

          {errorGlobal && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorGlobal}</span>
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Código</label>
                <input
                  type="text"
                  placeholder="Ej. ISI301"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none placeholder:text-neutral-300 uppercase font-mono"
                  value={form.codigo}
                  onChange={(e) => actualizar('codigo', e.target.value)}
                  disabled={procesando}
                />
                {errores.codigo && <p className="text-[11px] text-red-600 font-medium">{errores.codigo}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Ciclo</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                  value={form.ciclo}
                  onChange={(e) => actualizar('ciclo', e.target.value ? Number(e.target.value) : 1)}
                  disabled={procesando}
                />
                {errores.ciclo && <p className="text-[11px] text-red-600 font-medium">{errores.ciclo}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Nombre del Curso</label>
              <input
                type="text"
                placeholder="Ej. Estructura de Datos"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none placeholder:text-neutral-300"
                value={form.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
                disabled={procesando}
              />
              {errores.nombre && <p className="text-[11px] text-red-600 font-medium">{errores.nombre}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Créditos</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                  value={form.creditos}
                  onChange={(e) => actualizar('creditos', e.target.value ? Number(e.target.value) : 0)}
                  disabled={procesando}
                />
                {errores.creditos && <p className="text-[11px] text-red-600 font-medium">{errores.creditos}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Horas Semanales</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                  value={form.horasSemanales}
                  onChange={(e) => actualizar('horasSemanales', e.target.value ? Number(e.target.value) : 0)}
                  disabled={procesando}
                />
                {errores.horasSemanales && <p className="text-[11px] text-red-600 font-medium">{errores.horasSemanales}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Especialidad</label>
              <select
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                value={form.especialidadId}
                onChange={(e) => actualizar('especialidadId', Number(e.target.value))}
                disabled={procesando}
              >
                {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                ))}
              </select>
              {errores.especialidadId && <p className="text-[11px] text-red-600 font-medium">{errores.especialidadId}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Prerrequisito (Opcional)</label>
              <select
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                value={form.prerequisitoId ?? ''}
                onChange={(e) => actualizar('prerequisitoId', e.target.value ? Number(e.target.value) : null)}
                disabled={procesando}
              >
                <option value="">Ninguno</option>
                {prerrequisitosViables.map((c) => (
                  <option key={c.id} value={c.id}>[{c.codigo}] {c.nombre}</option>
                ))}
              </select>
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
                {procesando ? 'Guardando...' : 'Guardar Curso'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
