import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useCohorte } from '@/hooks/useCohorte'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users } from 'lucide-react'

const COLOR_LINEA = '#2563eb' // blue-600

export default function CohortesPage() {
  const {
    cargandoFiltros,
    cargando,
    especialidades,
    especialidadId,
    setEspecialidadId,
    anioIngreso,
    setAnioIngreso,
    aniosDisponibles,
    cohorte,
  } = useCohorte()

  const datosGrafico = (cohorte?.evolucion ?? [])
    .filter((p) => p.promedio != null)
    .map((p) => ({ periodo: p.periodo, promedio: p.promedio as number }))

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-neutral-400" />
              Análisis por Cohorte
            </h1>
            <p className="text-sm text-neutral-500">
              Retención y evolución del rendimiento por cohorte de ingreso.
            </p>
          </div>
          <div className="flex gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Año de ingreso</label>
              <select
                className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                value={anioIngreso}
                disabled={cargandoFiltros}
                onChange={(e) => setAnioIngreso(e.target.value === '' ? '' : Number(e.target.value))}
              >
                {aniosDisponibles.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Especialidad</label>
              <select
                className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm min-w-[220px]"
                value={especialidadId}
                disabled={cargandoFiltros}
                onChange={(e) => setEspecialidadId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {cargando || cargandoFiltros ? (
          <p className="text-sm text-neutral-500 py-16 text-center">Cargando análisis...</p>
        ) : !cohorte ? (
          <p className="text-sm text-neutral-500 py-16 text-center">Selecciona año de ingreso y especialidad.</p>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ingresantes</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-extrabold text-neutral-900">{cohorte.ingresantes}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tasa de retención</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-extrabold text-blue-600">{cohorte.tasaRetencion.toFixed(1)}%</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Créditos aprob. / estudiante</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold text-neutral-900">
                    {cohorte.promedioCreditosAprobados.toFixed(1)}
                    <span className="text-base font-semibold text-neutral-400">/{cohorte.creditosCarrera}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Egresados</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-extrabold text-green-600">{cohorte.egresados}</div></CardContent>
              </Card>
            </div>

            {/* Desglose */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Estado de la cohorte {cohorte.anioIngreso} · {cohorte.especialidad}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500" /> Activos: <b>{cohorte.activos}</b>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Egresados: <b>{cohorte.egresados}</b>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-neutral-400" /> Inactivos: <b>{cohorte.inactivos}</b>
                  </span>
                </div>
                {/* Barra proporcional */}
                {cohorte.ingresantes > 0 && (
                  <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full bg-blue-500" style={{ width: `${(cohorte.activos / cohorte.ingresantes) * 100}%` }} />
                    <div className="h-full bg-green-500" style={{ width: `${(cohorte.egresados / cohorte.ingresantes) * 100}%` }} />
                    <div className="h-full bg-neutral-400" style={{ width: `${(cohorte.inactivos / cohorte.ingresantes) * 100}%` }} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evolucion del promedio por semestre */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-neutral-400" />
                  Evolución del promedio por semestre
                </CardTitle>
              </CardHeader>
              <CardContent>
                {datosGrafico.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-12 text-center">
                    No hay notas registradas para esta cohorte todavía.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={datosGrafico} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: '#525252' }} />
                      <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#525252' }} />
                      <Tooltip
                        formatter={(value) => [Number(value).toFixed(2), 'Promedio']}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="promedio"
                        name="Promedio"
                        stroke={COLOR_LINEA}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
