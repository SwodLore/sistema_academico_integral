import { useReporteConsolidado } from '@/hooks/useReporteConsolidado'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileSpreadsheet, FileText, FileBarChart } from 'lucide-react'

const NOTA_MINIMA = 10.5

function SituacionBadge({ situacion }: { situacion: string }) {
  const variant =
    situacion === 'Aprobado'
      ? 'success'
      : situacion === 'Desaprobado'
        ? 'destructive'
        : situacion === 'En curso'
          ? 'warning'
          : 'default'
  return (
    <Badge variant={variant} className="text-[10px] font-bold uppercase tracking-wider">
      {situacion}
    </Badge>
  )
}

export default function ReportesPage() {
  const {
    cargandoFiltros,
    cargando,
    exportando,
    especialidades,
    especialidadId,
    setEspecialidadId,
    anio,
    semestre,
    aniosDisponibles,
    semestresDisponibles,
    cambiarAnio,
    setSemestre,
    reporte,
    exportar,
  } = useReporteConsolidado()

  const hayDatos = reporte != null && reporte.estudiantes.length > 0
  const promAprobado = reporte?.promedioGeneral != null && reporte.promedioGeneral >= NOTA_MINIMA

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-neutral-400" />
            Reporte Consolidado
          </h1>
          <p className="text-sm text-neutral-500">
            Rendimiento por especialidad y periodo. Exporta en PDF o Excel para tu documentación.
          </p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap gap-3">
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
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Año</label>
                  <select
                    className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                    value={anio}
                    disabled={cargandoFiltros}
                    onChange={(e) => cambiarAnio(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    {aniosDisponibles.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Semestre</label>
                  <select
                    className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                    value={semestre}
                    disabled={cargandoFiltros}
                    onChange={(e) => setSemestre(e.target.value)}
                  >
                    {semestresDisponibles.map((s) => (
                      <option key={s} value={s}>Semestre {s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-1.5" disabled={!hayDatos || exportando} onClick={() => exportar('pdf')}>
                  <FileText className="w-4 h-4" /> PDF
                </Button>
                <Button variant="outline" className="gap-1.5" disabled={!hayDatos || exportando} onClick={() => exportar('excel')}>
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Resumen */}
            {reporte && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Estudiantes</p>
                  <p className="text-2xl font-extrabold text-neutral-900">{reporte.totalEstudiantes}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Promedio general</p>
                  <p className={`text-2xl font-extrabold ${
                    reporte.promedioGeneral == null ? 'text-neutral-400' : promAprobado ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {reporte.promedioGeneral == null ? '-' : reporte.promedioGeneral.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Aprobados</p>
                  <p className="text-2xl font-extrabold text-green-600">{reporte.aprobados}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Desaprobados</p>
                  <p className="text-2xl font-extrabold text-red-600">{reporte.desaprobados}</p>
                </div>
              </div>
            )}

            {/* Tabla */}
            {cargando || cargandoFiltros ? (
              <p className="text-sm text-neutral-500 py-8 text-center">Cargando reporte...</p>
            ) : !reporte ? (
              <p className="text-sm text-neutral-500 py-8 text-center">Selecciona especialidad, año y semestre.</p>
            ) : reporte.estudiantes.length === 0 ? (
              <p className="text-sm text-neutral-500 py-8 text-center">
                No hay estudiantes matriculados para esta especialidad en el periodo {reporte.periodo}.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                      <th className="px-4 py-3 font-semibold text-neutral-600">Estudiante</th>
                      <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Créd.</th>
                      <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Cursos</th>
                      <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Aprob.</th>
                      <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Desap.</th>
                      <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Promedio</th>
                      <th className="px-4 py-3 font-semibold text-neutral-600 text-center">Situación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.estudiantes.map((e) => (
                      <tr key={e.codigo} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                        <td className="px-4 py-2.5">
                          <div className="font-semibold text-neutral-800">{e.nombre}</div>
                          <div className="text-xs text-neutral-400">{e.codigo}</div>
                        </td>
                        <td className="px-3 py-2.5 text-center text-neutral-600">{e.creditos}</td>
                        <td className="px-3 py-2.5 text-center text-neutral-600">{e.cursos}</td>
                        <td className="px-3 py-2.5 text-center text-green-700 font-semibold">{e.aprobados}</td>
                        <td className="px-3 py-2.5 text-center text-red-700 font-semibold">{e.desaprobados}</td>
                        <td className={`px-3 py-2.5 text-center font-bold ${
                          e.promedio == null ? 'text-neutral-300' : e.promedio >= NOTA_MINIMA ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {e.promedio == null ? '-' : e.promedio.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-center"><SituacionBadge situacion={e.situacion} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
