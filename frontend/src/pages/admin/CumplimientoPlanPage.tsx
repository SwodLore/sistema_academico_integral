import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { catalogosApi, periodosApi } from '@/api'
import { cursosApi, type CumplimientoPlan } from '@/api/cursos'
import { getApiError } from '@/lib/apiError'
import type { Especialidad, PeriodoAcademico } from '@/types'
import { exportarApi } from '@/api/exportar'
import BotonesExportar from '@/components/BotonesExportar'
import { Check, ListChecks, X } from 'lucide-react'

function Marca({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium">
      <Check className="size-3.5" /> Sí
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
      <X className="size-3.5" /> No
    </span>
  )
}

export default function CumplimientoPlanPage() {
  const [datos, setDatos] = useState<CumplimientoPlan | null>(null)
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [especialidadId, setEspecialidadId] = useState<number>(0)
  const [periodoSel, setPeriodoSel] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([catalogosApi.especialidades(), periodosApi.listar()])
      .then(([esps, pers]) => {
        setEspecialidades(esps)
        setPeriodos(pers)
        if (esps.length > 0) setEspecialidadId(esps[0].id)
      })
      .catch((err) => toast.error(getApiError(err)))
  }, [])

  const cargar = useCallback(async () => {
    if (!especialidadId) return
    setCargando(true)
    try {
      const periodo = periodos.find((p) => p.codigo === periodoSel)
      setDatos(
        await cursosApi.cumplimientoPlan({
          especialidadId,
          ...(periodo ? { anio: periodo.anio, semestre: periodo.semestre } : {}),
        })
      )
    } catch (err) {
      toast.error(getApiError(err))
      setDatos(null)
    } finally {
      setCargando(false)
    }
  }, [especialidadId, periodoSel, periodos])

  useEffect(() => {
    cargar()
  }, [cargar])

  const tarjetas = datos
    ? [
        { titulo: 'Cumplimiento', valor: `${datos.resumen.porcentaje}%`, detalle: 'Docente, horario y sílabo' },
        { titulo: 'Cursos del plan', valor: datos.resumen.totalCursos, detalle: `Periodo ${datos.periodo}` },
        {
          titulo: 'Con docente y horario',
          valor: `${datos.resumen.conDocente} / ${datos.resumen.conHorario}`,
          detalle: 'Asignados / con horario',
        },
        { titulo: 'Sílabos cargados', valor: datos.resumen.conSilabo, detalle: 'Cursos con sílabo publicado' },
      ]
    : []

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
              <ListChecks className="size-6 text-neutral-700" />
              Cumplimiento del Plan
            </h1>
            <p className="text-sm text-neutral-500">
              Estado del plan de estudios en el periodo: docentes, horarios y sílabos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
              value={especialidadId}
              onChange={(e) => setEspecialidadId(Number(e.target.value))}
            >
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>{esp.nombre}</option>
              ))}
            </select>
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
              nombre={`cumplimiento_${datos?.periodo ?? ''}`}
              disabled={!datos || !especialidadId}
              exportar={(formato) => {
                const periodo = periodos.find((p) => p.codigo === periodoSel)
                return exportarApi.cumplimiento(formato, {
                  especialidadId,
                  ...(periodo ? { anio: periodo.anio, semestre: periodo.semestre } : {}),
                })
              }}
            />
          </div>
        </div>

        {cargando ? (
          <p className="text-sm text-neutral-500 py-8 text-center">Cargando...</p>
        ) : !datos ? (
          <p className="text-sm text-neutral-500 py-8 text-center">Sin datos para mostrar.</p>
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
                <CardTitle className="text-lg">Detalle por curso — {datos.especialidad}</CardTitle>
                <CardDescription>
                  Cursos del plan de estudios y su estado en el periodo {datos.periodo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {datos.cursos.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-6 text-center">
                    Esta especialidad no tiene cursos registrados en su plan.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-left text-neutral-500">
                          <th className="py-2 pr-4 font-medium">Ciclo</th>
                          <th className="py-2 pr-4 font-medium">Curso</th>
                          <th className="py-2 pr-4 font-medium">Docente</th>
                          <th className="py-2 pr-4 font-medium">Horario</th>
                          <th className="py-2 font-medium">Sílabo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datos.cursos.map((curso) => {
                          const completo = curso.docenteAsignado && curso.horario && curso.silabo
                          return (
                            <tr
                              key={curso.cursoId}
                              className={`border-b border-neutral-100 ${completo ? '' : 'bg-amber-50/50'}`}
                            >
                              <td className="py-2 pr-4 text-neutral-700">{curso.ciclo}</td>
                              <td className="py-2 pr-4">
                                <p className="font-medium text-neutral-900">{curso.codigo} - {curso.nombre}</p>
                              </td>
                              <td className="py-2 pr-4">
                                {curso.docenteAsignado ? (
                                  <span className="text-xs text-neutral-700">{curso.docente}</span>
                                ) : (
                                  <Marca ok={false} />
                                )}
                              </td>
                              <td className="py-2 pr-4"><Marca ok={curso.horario} /></td>
                              <td className="py-2"><Marca ok={curso.silabo} /></td>
                            </tr>
                          )
                        })}
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
