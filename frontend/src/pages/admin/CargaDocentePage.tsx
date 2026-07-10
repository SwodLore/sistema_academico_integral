import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { docentesApi, catalogosApi, periodosApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import { toast } from 'sonner'
import type { DocenteCargaResumen, DocenteCarga, Especialidad, PeriodoAcademico } from '@/types'
import { 
  Users, 
  BookOpen, 
  Search, 
  Eye, 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  Filter,
  AlertTriangle,
  Info
} from 'lucide-react'

export default function CargaDocentePage() {
  // Master Lists
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [cargandoFiltros, setCargandoFiltros] = useState(true)

  // Filters State
  const [anio, setAnio] = useState<number | ''>('')
  const [semestre, setSemestre] = useState<string>('')
  const [especialidadId, setEspecialidadId] = useState<number | ''>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Data Loading
  const [docentesCarga, setDocentesCarga] = useState<DocenteCargaResumen[]>([])
  const [cargandoListado, setCargandoListado] = useState(false)

  // Detail Modal State
  const [selectedDocente, setSelectedDocente] = useState<DocenteCargaResumen | null>(null)
  const [detalleCarga, setDetalleCarga] = useState<DocenteCarga | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  // Extract unique years
  const aniosDisponibles = useMemo(() => {
    return Array.from(new Set(periodos.map((p) => p.anio))).sort((a, b) => b - a)
  }, [periodos])

  // Extract semestres for selected year
  const semestresDisponibles = useMemo(() => {
    if (anio === '') return []
    return periodos
      .filter((p) => p.anio === anio)
      .map((p) => p.semestre)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort()
  }, [periodos, anio])

  // Load Filters initial data
  useEffect(() => {
    async function cargarFiltros() {
      setCargandoFiltros(true)
      try {
        const [listaPeriodos, listaEspecialidades] = await Promise.all([
          periodosApi.listar(),
          catalogosApi.especialidades(),
        ])
        setPeriodos(listaPeriodos)
        setEspecialidades(listaEspecialidades)

        // Set default values based on active period
        const activo = listaPeriodos.find((p) => p.activo) ?? listaPeriodos[0]
        if (activo) {
          setAnio(activo.anio)
          setSemestre(activo.semestre)
        }
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargandoFiltros(false)
      }
    }
    cargarFiltros()
  }, [])

  // Auto update semester if year changes
  const cambiarAnio = (nuevoAnio: number | '') => {
    setAnio(nuevoAnio)
    const sems = periodos.filter((p) => p.anio === nuevoAnio).map((p) => p.semestre)
    if (sems.length > 0) {
      // If current semester is not in the new year's semesters, choose first one
      if (!sems.some((s) => s === semestre)) {
        setSemestre(sems[0])
      }
    } else {
      setSemestre('')
    }
  }

  // Load Docente list when filters change
  useEffect(() => {
    if (cargandoFiltros || anio === '' || !semestre) return

    async function cargarDocentes() {
      setCargandoListado(true)
      try {
        const data = await docentesApi.cargaDocenteList({
          anio: anio as number,
          semestre,
          especialidadId: especialidadId === '' ? undefined : especialidadId,
        })
        setDocentesCarga(data)
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargandoListado(false)
      }
    }
    cargarDocentes()
  }, [anio, semestre, especialidadId, cargandoFiltros])

  // Load teacher details when selected
  useEffect(() => {
    if (!selectedDocente || anio === '' || !semestre) return

    const docenteId = selectedDocente.docenteId

    async function cargarDetalle() {
      setCargandoDetalle(true)
      try {
        const data = await docentesApi.cargaDocenteDetalle(docenteId, {
          anio: anio as number,
          semestre,
          especialidadId: especialidadId === '' ? undefined : (especialidadId as number),
        })
        setDetalleCarga(data)
      } catch (err) {
        toast.error(getApiError(err))
        setSelectedDocente(null)
      } finally {
        setCargandoDetalle(false)
      }
    }
    cargarDetalle()
  }, [selectedDocente, anio, semestre, especialidadId])

  // Search filter
  const docentesFiltrados = useMemo(() => {
    if (!searchQuery) return docentesCarga
    const q = searchQuery.toLowerCase()
    return docentesCarga.filter(
      (d) =>
        d.nombreCompleto.toLowerCase().includes(q) ||
        d.codigoDocente.toLowerCase().includes(q) ||
        d.dni.includes(q)
    )
  }, [docentesCarga, searchQuery])

  // Workload analysis stats
  const stats = useMemo(() => {
    const total = docentesCarga.length
    if (total === 0) return { total, promedioHoras: 0, cargaAlta: 0, sinCarga: 0 }

    const sumHoras = docentesCarga.reduce((sum, d) => sum + d.totalHoras, 0)
    const cargaAlta = docentesCarga.filter((d) => d.totalHoras > 16).length
    const sinCarga = docentesCarga.filter((d) => d.totalHoras === 0).length

    return {
      total,
      promedioHoras: Number((sumHoras / total).toFixed(1)),
      cargaAlta,
      sinCarga,
    }
  }, [docentesCarga])

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-neutral-500" />
              Carga Docente
            </h1>
            <p className="text-sm text-neutral-500">
              Evalúa y haz seguimiento a la carga académica y horas de dictado de los docentes por especialidad.
            </p>
          </div>
        </div>

        {/* Filters and Stats Bar */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b border-neutral-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                <Filter className="w-4 h-4 text-neutral-400" />
                Filtros de Búsqueda
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Year Select */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-400">Año:</span>
                  <select
                    className="h-9 rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                    value={anio}
                    disabled={cargandoFiltros}
                    onChange={(e) => cambiarAnio(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">Seleccione</option>
                    {aniosDisponibles.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {/* Semester Select */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-400">Semestre:</span>
                  <select
                    className="h-9 rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                    value={semestre}
                    disabled={cargandoFiltros || anio === ''}
                    onChange={(e) => setSemestre(e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    {semestresDisponibles.map((s) => (
                      <option key={s} value={s}>Semestre {s}</option>
                    ))}
                  </select>
                </div>

                {/* Specialty Select */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-400">Especialidad:</span>
                  <select
                    className="h-9 rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm max-w-[220px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                    value={especialidadId}
                    disabled={cargandoFiltros}
                    onChange={(e) => setEspecialidadId(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">Todas las especialidades</option>
                    {especialidades.map((esp) => (
                      <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col justify-between">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Total Docentes</span>
                <span className="text-2xl font-extrabold text-neutral-900 mt-1">{stats.total}</span>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col justify-between">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Promedio Horas</span>
                <span className="text-2xl font-extrabold text-primary mt-1">{stats.promedioHoras} hrs</span>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col justify-between">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Carga Excesiva (&gt;16h)</span>
                <span className="text-2xl font-extrabold text-amber-600 mt-1">{stats.cargaAlta}</span>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col justify-between">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Sin Carga Académica</span>
                <span className="text-2xl font-extrabold text-neutral-400 mt-1">{stats.sinCarga}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main List */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Resumen de Carga Académica</CardTitle>
              <CardDescription>
                Haga clic en un docente para ver el detalle de asignaciones lectivas, horas y horarios.
              </CardDescription>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar docente o código..."
                className="pl-9 h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {cargandoListado ? (
              <div className="text-center py-16">
                <p className="text-sm text-neutral-500">Cargando datos de carga docente...</p>
              </div>
            ) : docentesFiltrados.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">No se encontraron docentes con los criterios de búsqueda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                      <th className="px-4 py-3.5 font-semibold text-neutral-600">Código / DNI</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600">Docente</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600">Grado / Facultad</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600 text-center">Cursos</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600 text-center">Horas Semanales</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600 text-center">Estado</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docentesFiltrados.map((docente) => {
                      const horas = docente.totalHoras
                      let statusBadge = <Badge variant="default" className="bg-neutral-100 text-neutral-700">Sin carga</Badge>
                      if (horas > 0 && horas <= 16) {
                        statusBadge = <Badge variant="success" className="bg-green-50 text-green-700 border-green-200">Adecuado</Badge>
                      } else if (horas > 16) {
                        statusBadge = <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">Excedido</Badge>
                      }

                      return (
                        <tr 
                          key={docente.docenteId} 
                          className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 cursor-pointer"
                          onClick={() => setSelectedDocente(docente)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-neutral-800">{docente.codigoDocente}</div>
                            <div className="text-xs text-neutral-400">DNI: {docente.dni}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-neutral-900">{docente.nombreCompleto}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="text-neutral-700 text-xs font-medium flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                              {docente.gradoAcademico || 'No especificado'}
                            </div>
                            <div className="text-neutral-500 text-xs mt-0.5">{docente.facultadNombre || 'Sin facultad'}</div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge className="bg-neutral-100 text-neutral-800 border-neutral-200 font-bold">
                              {docente.cantidadCursos}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-semibold text-neutral-800">{docente.totalHoras} hrs</span>
                              <div className="w-16 bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${horas > 16 ? 'bg-amber-500' : 'bg-primary'}`} 
                                  style={{ width: `${Math.min((horas / 20) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {statusBadge}
                          </td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="size-8 p-0"
                              onClick={() => setSelectedDocente(docente)}
                            >
                              <Eye className="w-4 h-4 text-neutral-500 hover:text-neutral-800" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detalle Modal */}
      <Dialog open={selectedDocente !== null} onOpenChange={(open) => !open && setSelectedDocente(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <div className="pb-4 border-b border-neutral-100">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-neutral-500" />
              Detalle de Carga Académica
            </DialogTitle>
            <DialogDescription>
              Resumen detallado del plan de estudios y asignaciones lectivas para el periodo seleccionado.
            </DialogDescription>
          </div>

          {cargandoDetalle ? (
            <div className="flex-1 text-center py-20">
              <p className="text-sm text-neutral-500">Cargando asignaciones del docente...</p>
            </div>
          ) : !detalleCarga || !selectedDocente ? (
            <div className="flex-1 text-center py-20">
              <p className="text-sm text-neutral-500">No se pudieron obtener los detalles.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-6">
              
              {/* Teacher Info and summary stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2">
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Perfil del Docente</div>
                  <div className="font-bold text-neutral-900 text-lg">{selectedDocente.nombreCompleto}</div>
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-neutral-600">
                    <div><span className="font-medium text-neutral-400">Código:</span> {selectedDocente.codigoDocente}</div>
                    <div><span className="font-medium text-neutral-400">DNI:</span> {selectedDocente.dni}</div>
                    <div><span className="font-medium text-neutral-400">Grado:</span> {selectedDocente.gradoAcademico || '-'}</div>
                    <div><span className="font-medium text-neutral-400">Facultad:</span> {selectedDocente.facultadNombre || '-'}</div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex flex-col justify-between">
                  <div className="text-xs font-semibold text-primary/70 uppercase tracking-wide">Carga en este periodo</div>
                  <div className="grid grid-cols-3 gap-2 text-center mt-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500">Cursos</span>
                      <span className="text-lg font-bold text-neutral-800">{detalleCarga.cursos.length}</span>
                    </div>
                    <div className="flex flex-col border-x border-neutral-200">
                      <span className="text-xs text-neutral-500">Créditos</span>
                      <span className="text-lg font-bold text-neutral-800">{detalleCarga.totalCreditos}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500">Horas</span>
                      <span className="text-lg font-bold text-primary">{detalleCarga.totalHoras}</span>
                    </div>
                  </div>
                  
                  {/* Warning on overload */}
                  {detalleCarga.totalHoras > 16 && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 mt-2">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Carga excede las 16 horas recomendadas.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Courses Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-neutral-400" />
                  Cursos Dictados
                </h3>

                {detalleCarga.cursos.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-neutral-200 rounded-lg">
                    <p className="text-sm text-neutral-500">El docente no tiene cursos asignados para estos filtros en este periodo.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-neutral-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                          <th className="px-3 py-2.5 font-semibold text-neutral-600">Código</th>
                          <th className="px-3 py-2.5 font-semibold text-neutral-600">Curso / Especialidad</th>
                          <th className="px-3 py-2.5 font-semibold text-neutral-600 text-center">Ciclo</th>
                          <th className="px-3 py-2.5 font-semibold text-neutral-600 text-center">Sec.</th>
                          <th className="px-3 py-2.5 font-semibold text-neutral-600 text-center">Créd.</th>
                          <th className="px-3 py-2.5 font-semibold text-neutral-600 text-center">Horas</th>
                          <th className="px-3 py-2.5 font-semibold text-neutral-600">Horarios y Aulas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalleCarga.cursos.map((c) => (
                          <tr key={c.asignacionId} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                            <td className="px-3 py-2.5 font-mono font-medium text-neutral-700">{c.codigo}</td>
                            <td className="px-3 py-2.5">
                              <div className="font-medium text-neutral-900">{c.nombre}</div>
                              <div className="text-[10px] text-neutral-400">{c.especialidadNombre || 'Sin especialidad'}</div>
                            </td>
                            <td className="px-3 py-2.5 text-center font-medium text-neutral-600">
                              {c.ciclo != null ? `Ciclo ${c.ciclo}` : '-'}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <Badge variant="outline" className="font-bold text-[10px] px-1 py-0 h-4 border-neutral-300">
                                {c.seccion}
                              </Badge>
                            </td>
                            <td className="px-3 py-2.5 text-center font-semibold text-neutral-700">{c.creditos}</td>
                            <td className="px-3 py-2.5 text-center font-semibold text-neutral-700">{c.horasSemanales} hrs</td>
                            <td className="px-3 py-2.5">
                              {c.horarios.length === 0 ? (
                                <span className="text-neutral-400 italic text-[10px]">No registrado</span>
                              ) : (
                                <div className="flex flex-col gap-0.5">
                                  {c.horarios.map((h, i) => (
                                    <div key={i} className="flex items-center gap-1 text-neutral-600 text-[10px]">
                                      <Calendar className="w-3 h-3 text-neutral-400" />
                                      <span className="font-medium">{h.dia}:</span>
                                      <span>{h.horaInicio}-{h.horaFin}</span>
                                      {h.aula && (
                                        <Badge className="bg-primary/10 text-primary border-0 text-[9px] scale-90 origin-left px-1 py-0 h-3.5 font-semibold">
                                          {h.aula}
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Study Plan Compliance Info Card */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-neutral-800">Evaluación de Cumplimiento del Plan de Estudios</h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Las asignaciones docentes listadas corresponden a la oferta académica registrada en este periodo. La carga académica se calcula sumando las horas lectivas semanales. Asegúrese de que las especialidades tengan las asignaciones completas de horas docentes y aulas según lo establecido en el plan curricular.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-neutral-100 flex justify-end shrink-0">
            <Button onClick={() => setSelectedDocente(null)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
