import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  BarChart3,
  FileBarChart,
  ListChecks,
  PieChart,
  TrendingUp,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { indicadoresApi, matriculasApi, periodosApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import type { EstadisticasMatricula, Indicadores } from '@/types'

const ACCESOS: { to: string; label: string; descripcion: string; icon: LucideIcon }[] = [
  { to: '/admin/indicadores', label: 'Indicadores', descripcion: 'Rendimiento académico por periodo', icon: BarChart3 },
  { to: '/admin/estadisticas-matricula', label: 'Estadísticas de Matrícula', descripcion: 'Avance del proceso de matrícula', icon: PieChart },
  { to: '/admin/cumplimiento-plan', label: 'Cumplimiento del Plan', descripcion: 'Docentes, horarios y sílabos', icon: ListChecks },
  { to: '/admin/cohortes', label: 'Cohortes', descripcion: 'Desempeño por año de ingreso', icon: TrendingUp },
  { to: '/admin/reportes', label: 'Reportes', descripcion: 'Consolidados en PDF y Excel', icon: FileBarChart },
  { to: '/admin/carga-docente', label: 'Carga Docente', descripcion: 'Distribución de la carga académica', icon: UserCheck },
]

export default function DireccionDashboardPage() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null)
  const [matriculas, setMatriculas] = useState<EstadisticasMatricula | null>(null)
  const [periodo, setPeriodo] = useState<string>('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const periodos = await periodosApi.listar()
        const activo = periodos.find((p) => p.activo) ?? periodos[0]
        if (activo) {
          setPeriodo(activo.codigo)
          const [ind, est] = await Promise.all([
            indicadoresApi.obtener({ anio: activo.anio, semestre: activo.semestre }),
            matriculasApi.estadisticas({ anio: activo.anio, semestre: activo.semestre }),
          ])
          setIndicadores(ind)
          setMatriculas(est)
        }
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const kpis = [
    {
      titulo: 'Promedio general',
      valor: indicadores?.promedioGeneral != null ? indicadores.promedioGeneral.toFixed(2) : '—',
      detalle: 'Notas del periodo',
    },
    {
      titulo: 'Tasa de aprobación',
      valor: indicadores ? `${indicadores.tasaAprobacion}%` : '—',
      detalle: `${indicadores?.aprobados ?? 0} aprobados`,
    },
    {
      titulo: 'Matriculados',
      valor: matriculas?.porEstado.MATRICULADO ?? '—',
      detalle: `${matriculas?.total ?? 0} solicitudes`,
    },
    {
      titulo: 'Estudiantes calificados',
      valor: indicadores?.totalCalificados ?? '—',
      detalle: `${indicadores?.totalEstudiantes ?? 0} en total`,
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Panel de Dirección</h1>
          <p className="text-sm text-neutral-500">
            Supervisión académica del periodo {periodo || 'activo'}
          </p>
        </div>

        {cargando ? (
          <p className="text-sm text-neutral-500 py-8 text-center">Cargando...</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((k) => (
                <Card key={k.titulo}>
                  <CardContent className="pt-4">
                    <p className="text-sm text-neutral-500">{k.titulo}</p>
                    <p className="text-3xl font-bold text-neutral-900">{k.valor}</p>
                    <p className="text-xs text-neutral-400 mt-1">{k.detalle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {indicadores && indicadores.especialidades.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rendimiento por especialidad</CardTitle>
                  <CardDescription>Promedio y aprobación en el periodo {indicadores.periodo}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-left text-neutral-500">
                          <th className="py-2 pr-4 font-medium">Especialidad</th>
                          <th className="py-2 pr-4 font-medium text-right">Estudiantes</th>
                          <th className="py-2 pr-4 font-medium text-right">Promedio</th>
                          <th className="py-2 font-medium text-right">Aprobación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {indicadores.especialidades.map((esp) => (
                          <tr key={esp.especialidadId} className="border-b border-neutral-100">
                            <td className="py-2 pr-4 font-medium text-neutral-900">{esp.especialidad}</td>
                            <td className="py-2 pr-4 text-right text-neutral-700">{esp.estudiantes}</td>
                            <td className="py-2 pr-4 text-right text-neutral-700">
                              {esp.promedio != null ? esp.promedio.toFixed(2) : '—'}
                            </td>
                            <td className="py-2 text-right text-neutral-700">{esp.tasaAprobacion}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Módulos de supervisión
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ACCESOS.map((a) => {
                  const Icon = a.icon
                  return (
                    <Link
                      key={a.to}
                      to={a.to}
                      className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      <span className="rounded-md bg-neutral-100 p-2 text-neutral-700">
                        <Icon className="size-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-neutral-900">{a.label}</span>
                        <span className="block text-xs text-neutral-500">{a.descripcion}</span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
