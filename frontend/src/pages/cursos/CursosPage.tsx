import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, ClipboardList, Clock, MapPin, RefreshCw } from 'lucide-react'
import type { PeriodoAcademico } from '@/types'

interface HorarioDTO {
  dia: string
  horaInicio: string
  horaFin: string
  aula?: string
}

interface CursoAsignado {
  asignacionId: number
  cursoId: number
  codigo: string
  nombre: string
  seccion: string
  creditos: number
  horasSemanales: number
  horarios: HorarioDTO[]
}

interface DocenteCargaResponse {
  totalCreditos: number
  totalHoras: number
  cursos: CursoAsignado[]
}

const DIA_LABELS: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
}

function getMensajeError(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } }
  return error.response?.data?.message ?? 'Ocurrió un error al cargar la información'
}

export default function CursosPage() {
  const navigate = useNavigate()
  const [cargandoPeriodos, setCargandoPeriodos] = useState(true)
  const [cargandoCarga, setCargandoCarga] = useState(false)
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [anio, setAnio] = useState<number | ''>('')
  const [semestre, setSemestre] = useState<string>('')
  const [carga, setCarga] = useState<DocenteCargaResponse | null>(null)

  // Cargar periodos al montar
  useEffect(() => {
    async function cargarPeriodos() {
      try {
        const res = await api.get<PeriodoAcademico[]>('/periodos')
        setPeriodos(res.data)
        
        // Buscar periodo activo por defecto
        const activo = res.data.find((p) => p.activo)
        if (activo) {
          setAnio(activo.anio)
          setSemestre(activo.semestre)
        } else if (res.data.length > 0) {
          setAnio(res.data[0].anio)
          setSemestre(res.data[0].semestre)
        }
      } catch (err) {
        toast.error(getMensajeError(err))
      } finally {
        setCargandoPeriodos(false)
      }
    }
    cargarPeriodos()
  }, [])

  // Cargar carga académica cuando cambie el periodo
  useEffect(() => {
    if (anio === '' || !semestre) return

    async function cargarCargaAcademica() {
      setCargandoCarga(true)
      try {
        const res = await api.get<DocenteCargaResponse>('/docentes/cursos-asignados', {
          params: { anio, semestre },
        })
        setCarga(res.data)
      } catch (err) {
        toast.error(getMensajeError(err))
      } finally {
        setCargandoCarga(false)
      }
    }

    cargarCargaAcademica()
  }, [anio, semestre])

  // Obtener años únicos para el filtro
  const aniosDisponibles = Array.from(new Set(periodos.map((p) => p.anio))).sort((a, b) => b - a)

  // Obtener semestres disponibles para el año seleccionado
  const semestresDisponibles = periodos
    .filter((p) => p.anio === anio)
    .map((p) => p.semestre)
    // Eliminar duplicados
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()

  if (cargandoPeriodos) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
        <p className="text-neutral-500 text-sm">Cargando periodos académicos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Mis Cursos Asignados
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Visualiza tu carga académica, secciones asignadas, horarios y aulas.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Año
            </label>
            <select
              value={anio}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : ''
                setAnio(val)
                // Ajustar el semestre si el actual no existe en el nuevo año
                const sems = periodos.filter((p) => p.anio === val).map((p) => p.semestre as string)
                if (sems.length > 0 && !sems.includes(semestre)) {
                  setSemestre(sems[0])
                }
              }}
              className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-md focus:ring-neutral-500 focus:border-neutral-500 block p-1.5 font-medium cursor-pointer"
            >
              {aniosDisponibles.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="h-8 w-px bg-neutral-200 self-end" />

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Semestre
            </label>
            <select
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-md focus:ring-neutral-500 focus:border-neutral-500 block p-1.5 font-medium cursor-pointer"
            >
              {semestresDisponibles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Carga académica Resumen */}
      {carga && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                Total Créditos
              </CardTitle>
              <BookOpen className="w-5 h-5 text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-neutral-900">{carga.totalCreditos}</div>
              <p className="text-xs text-neutral-400 mt-1">Créditos lectivos asignados</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                Horas Semanales
              </CardTitle>
              <Clock className="w-5 h-5 text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-neutral-900">{carga.totalHoras} hrs</div>
              <p className="text-xs text-neutral-400 mt-1">Horas totales de dictado semanal</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                Cursos Asignados
              </CardTitle>
              <Calendar className="w-5 h-5 text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-neutral-900">{carga.cursos.length}</div>
              <p className="text-xs text-neutral-400 mt-1">Secciones a cargo en este periodo</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {cargandoCarga ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
          <p className="text-neutral-500 text-sm">Cargando carga académica...</p>
        </div>
      ) : carga && carga.cursos.length === 0 ? (
        <Card className="border-dashed border-2 border-neutral-300 py-12 text-center bg-white">
          <CardContent className="space-y-3">
            <BookOpen className="w-12 h-12 text-neutral-300 mx-auto" />
            <h3 className="text-lg font-bold text-neutral-800">No se encontraron cursos</h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto">
              No tienes carga académica registrada o asignada para el periodo académico {anio}-{semestre}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {carga?.cursos.map((curso) => (
            <Card
              key={`${curso.cursoId}-${curso.seccion}`}
              className="flex flex-col justify-between overflow-hidden border border-neutral-200 hover:shadow-md hover:border-neutral-300 transition-all bg-white"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-800">
                      {curso.codigo}
                    </span>
                    <CardTitle className="text-lg font-bold text-neutral-900 leading-tight">
                      {curso.nombre}
                    </CardTitle>
                  </div>
                  <Badge variant="success" className="text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider flex-shrink-0">
                    Sec. {curso.seccion}
                  </Badge>
                </div>
                <CardDescription className="flex gap-4 mt-2">
                  <span className="flex items-center text-xs text-neutral-500 font-medium">
                    <BookOpen className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                    {curso.creditos} Créditos
                  </span>
                  <span className="flex items-center text-xs text-neutral-500 font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                    {curso.horasSemanales} hrs/semana
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 border-t border-neutral-100 bg-neutral-50/50 flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Horarios y Aulas
                </h4>
                {curso.horarios.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No hay horarios registrados.</p>
                ) : (
                  <div className="space-y-2">
                    {curso.horarios.map((h, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2.5 rounded-md border border-neutral-100 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                            {DIA_LABELS[h.dia] ?? h.dia}
                          </span>
                          <span className="text-xs font-semibold text-neutral-600">
                            {h.horaInicio} - {h.horaFin}
                          </span>
                        </div>
                        {h.aula && (
                          <div className="flex items-center gap-1 text-xs font-medium text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200/60 self-start sm:self-auto">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Aula: {h.aula}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full mt-4 gap-2"
                  onClick={() => navigate(`/cursos/${curso.asignacionId}/notas`)}
                >
                  <ClipboardList className="w-4 h-4" />
                  Registrar Notas
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
