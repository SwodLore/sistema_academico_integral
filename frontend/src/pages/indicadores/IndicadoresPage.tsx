import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useIndicadores } from '@/hooks/useIndicadores'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp } from 'lucide-react'
import type { IndicadorEspecialidad } from '@/types'
import { exportarApi } from '@/api/exportar'
import BotonesExportar from '@/components/BotonesExportar'

const COLOR_PROMEDIO = '#2563eb' // blue-600
const COLOR_APROBACION = '#16a34a' // green-600
const NOTA_MINIMA = 10.5

function fmt(valor: number | null, sufijo = ''): string {
  return valor === null || valor === undefined ? '-' : `${Number(valor).toFixed(valor % 1 === 0 ? 0 : 1)}${sufijo}`
}

function acortar(nombre: string): string {
  return nombre.length > 22 ? `${nombre.slice(0, 20)}…` : nombre
}

export default function IndicadoresPage() {
  const {
    cargandoPeriodos,
    cargando,
    anio,
    semestre,
    indicadores,
    aniosDisponibles,
    semestresDisponibles,
    cambiarAnio,
    setSemestre,
  } = useIndicadores()

  const especialidades: IndicadorEspecialidad[] = indicadores?.especialidades ?? []
  const datosGrafico = especialidades.map((e) => ({
    nombre: acortar(e.especialidad),
    promedio: e.promedio ?? 0,
    aprobacion: e.tasaAprobacion,
  }))

  const promedioAprobado =
    indicadores?.promedioGeneral != null && indicadores.promedioGeneral >= NOTA_MINIMA

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-neutral-400" />
              Indicadores Académicos
            </h1>
            <p className="text-sm text-neutral-500">
              Rendimiento general del semestre {indicadores ? `· ${indicadores.periodo}` : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <select
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
              value={anio}
              disabled={cargandoPeriodos}
              onChange={(e) => cambiarAnio(e.target.value === '' ? '' : Number(e.target.value))}
            >
              {aniosDisponibles.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
              value={semestre}
              disabled={cargandoPeriodos}
              onChange={(e) => setSemestre(e.target.value)}
            >
              {semestresDisponibles.map((s) => (
                <option key={s} value={s}>Semestre {s}</option>
              ))}
            </select>
            <BotonesExportar
              nombre={`indicadores_${indicadores?.periodo ?? ''}`}
              disabled={!indicadores}
              exportar={(formato) =>
                exportarApi.indicadores(formato, {
                  anio: anio === '' ? undefined : Number(anio),
                  semestre: semestre || undefined,
                })
              }
            />
          </div>
        </div>

        {cargando || cargandoPeriodos ? (
          <p className="text-sm text-neutral-500 py-16 text-center">Cargando indicadores...</p>
        ) : !indicadores ? (
          <p className="text-sm text-neutral-500 py-16 text-center">No se pudieron cargar los indicadores.</p>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Promedio general
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-extrabold ${
                    indicadores.promedioGeneral === null
                      ? 'text-neutral-400'
                      : promedioAprobado
                        ? 'text-green-600'
                        : 'text-red-600'
                  }`}>
                    {indicadores.promedioGeneral === null ? '-' : indicadores.promedioGeneral.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Tasa de aprobación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold text-green-600">{fmt(indicadores.tasaAprobacion, '%')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Tasa de desaprobación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold text-red-600">{fmt(indicadores.tasaDesaprobacion, '%')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Estudiantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold text-neutral-900">{indicadores.totalEstudiantes}</div>
                </CardContent>
              </Card>
            </div>

            <p className="text-xs text-neutral-400">
              La tasa de aprobación/desaprobación se calcula sobre los cursos ya evaluados
              ({indicadores.aprobados + indicadores.desaprobados} de {indicadores.totalCalificados + indicadores.pendientes}).
              {indicadores.pendientes > 0 && ` ${indicadores.pendientes} curso(s) aún sin nota final.`}
            </p>

            {/* Grafico comparativo entre especialidades */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-neutral-400" />
                  Comparativo entre especialidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {datosGrafico.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-12 text-center">
                    No hay datos de rendimiento para este periodo.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={datosGrafico} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#525252' }} interval={0} />
                      <YAxis
                        yAxisId="promedio"
                        domain={[0, 20]}
                        tick={{ fontSize: 11, fill: '#525252' }}
                        label={{ value: 'Promedio', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#737373' }}
                      />
                      <YAxis
                        yAxisId="aprobacion"
                        orientation="right"
                        domain={[0, 100]}
                        unit="%"
                        tick={{ fontSize: 11, fill: '#525252' }}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          const num = Number(value)
                          return name === 'Promedio' ? num.toFixed(2) : `${num.toFixed(1)}%`
                        }}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar yAxisId="promedio" dataKey="promedio" name="Promedio" fill={COLOR_PROMEDIO} radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="aprobacion" dataKey="aprobacion" name="% Aprobación" fill={COLOR_APROBACION} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Detalle por especialidad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalle por especialidad</CardTitle>
              </CardHeader>
              <CardContent>
                {especialidades.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-8 text-center">Sin especialidades con matrículas en este periodo.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-neutral-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                          <th className="px-4 py-3 font-semibold text-neutral-600">Especialidad</th>
                          <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Estudiantes</th>
                          <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Promedio</th>
                          <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Aprob.</th>
                          <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Desaprob.</th>
                          <th className="px-3 py-3 font-semibold text-neutral-600 text-center">% Aprob.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {especialidades.map((e) => (
                          <tr key={e.especialidadId} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                            <td className="px-4 py-3 font-medium text-neutral-800">{e.especialidad}</td>
                            <td className="px-3 py-3 text-center text-neutral-600">{e.estudiantes}</td>
                            <td className={`px-3 py-3 text-center font-bold ${
                              e.promedio === null
                                ? 'text-neutral-300'
                                : e.promedio >= NOTA_MINIMA
                                  ? 'text-green-700'
                                  : 'text-red-700'
                            }`}>
                              {e.promedio === null ? '-' : e.promedio.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-center text-green-700 font-semibold">{e.aprobados}</td>
                            <td className="px-3 py-3 text-center text-red-700 font-semibold">{e.desaprobados}</td>
                            <td className="px-3 py-3 text-center text-neutral-700">{fmt(e.tasaAprobacion, '%')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
