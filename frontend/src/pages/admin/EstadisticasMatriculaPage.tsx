import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { matriculasApi, periodosApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import type { EstadisticasMatricula, PeriodoAcademico } from '@/types'
import { exportarApi } from '@/api/exportar'
import BotonesExportar from '@/components/BotonesExportar'
import { PieChart } from 'lucide-react'

export default function EstadisticasMatriculaPage() {
  const [datos, setDatos] = useState<EstadisticasMatricula | null>(null)
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [periodoSel, setPeriodoSel] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const periodo = periodos.find((p) => p.codigo === periodoSel)
      const data = await matriculasApi.estadisticas(
        periodo ? { anio: periodo.anio, semestre: periodo.semestre } : undefined
      )
      setDatos(data)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCargando(false)
    }
  }, [periodos, periodoSel])

  useEffect(() => {
    periodosApi.listar().then(setPeriodos).catch(() => {})
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const pendientes = datos ? datos.porEstado.PENDIENTE + datos.porEstado.PAGADA : 0

  const tarjetas = datos
    ? [
        { titulo: 'Solicitudes', valor: datos.total, detalle: `Periodo ${datos.periodo}` },
        { titulo: 'Matriculados', valor: datos.porEstado.MATRICULADO, detalle: 'Validados con ficha oficial' },
        { titulo: 'En proceso', valor: pendientes, detalle: 'Pendientes de pago o validación' },
        { titulo: 'Rechazadas', valor: datos.porEstado.RECHAZADA, detalle: 'Solicitudes observadas' },
      ]
    : []

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
              <PieChart className="size-6 text-neutral-700" />
              Estadísticas de Matrícula
            </h1>
            <p className="text-sm text-neutral-500">Supervisión del proceso de matrícula por periodo</p>
          </div>
          <select
            className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
            value={periodoSel}
            onChange={(e) => setPeriodoSel(e.target.value)}
          >
            <option value="">Periodo activo</option>
            {periodos.map((p) => (
              <option key={p.id} value={p.codigo}>{p.codigo}</option>
            ))}
          </select>
          <BotonesExportar
            nombre={`matricula_${datos?.periodo ?? ''}`}
            disabled={!datos}
            exportar={(formato) => {
              const periodo = periodos.find((p) => p.codigo === periodoSel)
              return exportarApi.matricula(formato, periodo ? { anio: periodo.anio, semestre: periodo.semestre } : {})
            }}
          />
        </div>

        {cargando ? (
          <p className="text-sm text-neutral-500 py-8 text-center">Cargando...</p>
        ) : !datos ? (
          <p className="text-sm text-neutral-500 py-8 text-center">Sin datos para este periodo.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tarjetas.map((t) => (
                <Card key={t.titulo}>
                  <CardContent className="pt-4">
                    <p className="text-sm text-neutral-500">{t.titulo}</p>
                    <p className="text-3xl font-bold text-neutral-900">{t.valor}</p>
                    <p className="text-xs text-neutral-400 mt-1">{t.detalle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Por especialidad</CardTitle>
                <CardDescription>Distribución de solicitudes en el periodo {datos.periodo}</CardDescription>
              </CardHeader>
              <CardContent>
                {datos.porEspecialidad.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-6 text-center">No hay solicitudes en este periodo.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-left text-neutral-500">
                          <th className="py-2 pr-4 font-medium">Especialidad</th>
                          <th className="py-2 pr-4 font-medium text-right">Solicitudes</th>
                          <th className="py-2 pr-4 font-medium text-right">Matriculados</th>
                          <th className="py-2 pr-4 font-medium text-right">En proceso</th>
                          <th className="py-2 font-medium text-right">Rechazadas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datos.porEspecialidad.map((fila) => (
                          <tr key={fila.especialidad} className="border-b border-neutral-100">
                            <td className="py-2 pr-4 font-medium text-neutral-900">{fila.especialidad}</td>
                            <td className="py-2 pr-4 text-right text-neutral-700">{fila.solicitudes}</td>
                            <td className="py-2 pr-4 text-right text-neutral-700">{fila.matriculados}</td>
                            <td className="py-2 pr-4 text-right text-neutral-700">{fila.pendientes}</td>
                            <td className="py-2 text-right text-neutral-700">{fila.rechazadas}</td>
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
