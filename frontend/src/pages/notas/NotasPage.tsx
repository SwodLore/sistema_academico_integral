import { useState } from 'react'
import { useHojaNotas } from '@/hooks/useHojaNotas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, CheckCircle2, XCircle, RefreshCw, Clock, FileText, BookOpen } from 'lucide-react'
import type { NotaCurso } from '@/types'
import SilaboModal from '@/components/SilaboModal'

const NOTA_MINIMA = 10.5

function nota(valor: number | null): string {
  return valor === null || valor === undefined ? '-' : Number(valor).toFixed(2)
}

function EstadoCurso({ estado }: { estado: NotaCurso['estado'] }) {
  if (estado === 'APROBADO') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
        <CheckCircle2 className="w-4 h-4" /> Aprobado
      </span>
    )
  }
  if (estado === 'DESAPROBADO') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
        <XCircle className="w-4 h-4" /> Desaprobado
      </span>
    )
  }
  return <span className="text-xs font-medium text-neutral-400">Pendiente</span>
}

export default function NotasPage() {
  const { cargando, hoja } = useHojaNotas()
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(null)

  if (cargando) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
        <p className="text-neutral-500 text-sm">Cargando tus notas...</p>
      </div>
    )
  }

  if (!hoja) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500">No se pudieron cargar tus notas.</p>
      </div>
    )
  }

  const sinCursos = hoja.cursos.length === 0
  const matriculaPendiente = hoja.matriculaEstado === 'PENDIENTE'
  const matriculaRechazada = hoja.matriculaEstado === 'RECHAZADA'
  const promedioAprobado =
    hoja.promedioPonderado !== null && hoja.promedioPonderado >= NOTA_MINIMA

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">{hoja.periodo}</span>
          <Badge variant="info" className="text-[10px] font-bold uppercase tracking-wider">
            Ciclo {hoja.ciclo}
          </Badge>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-neutral-400" />
          Mis Notas
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Consulta tus notas del ciclo actual y tu promedio ponderado del semestre.
        </p>
      </div>

      {/* Estados sin cursos */}
      {!hoja.tieneMatricula && (
        <div className="rounded-lg border-2 border-dashed border-neutral-300 bg-white py-12 text-center">
          <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">
            Aún no tienes una matrícula registrada para el periodo <b>{hoja.periodo}</b>.
          </p>
        </div>
      )}

      {hoja.tieneMatricula && matriculaPendiente && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>
            Tu solicitud de matrícula está <b>pendiente de validación</b>. Podrás ver tus notas cuando sea
            aprobada.
          </span>
        </div>
      )}

      {hoja.tieneMatricula && matriculaRechazada && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>
            Tu solicitud de matrícula para el periodo <b>{hoja.periodo}</b> fue <b>rechazada</b>, por eso no hay
            notas que mostrar.
          </span>
        </div>
      )}

      {hoja.tieneMatricula && !matriculaPendiente && !matriculaRechazada && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Promedio ponderado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-extrabold ${hoja.promedioPonderado === null
                      ? 'text-neutral-400'
                      : promedioAprobado
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                >
                  {hoja.promedioPonderado === null ? '-' : hoja.promedioPonderado.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Aprobados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-green-600">{hoja.aprobados}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Desaprobados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-red-600">{hoja.desaprobados}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Créditos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-neutral-900">
                  {hoja.creditosAprobados}
                  <span className="text-base font-semibold text-neutral-400">/{hoja.totalCreditos}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formula */}
          <p className="mb-3 text-xs text-neutral-500">
            <b>Promedio final</b> = Parcial 1 ({hoja.pesoParcial1}%) + Parcial 2 ({hoja.pesoParcial2}%) + Prácticas
            ({hoja.pesoPracticas}%) + Examen Final ({hoja.pesoNotaFinal}%). Aprobado con nota ≥ {NOTA_MINIMA}. El
            promedio ponderado del semestre pondera cada curso por sus créditos.
          </p>

          {/* Tabla */}
          {sinCursos ? (
            <Card className="border-dashed border-2 border-neutral-300 py-12 text-center">
              <CardContent>
                <p className="text-sm text-neutral-500">No tienes cursos matriculados en este periodo.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                    <th className="px-4 py-3 font-semibold text-neutral-600">#</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Curso</th>
                    <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Créd.</th>
                    <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Parcial 1</th>
                    <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Parcial 2</th>
                    <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Prácticas</th>
                    <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Ex. Final</th>
                    <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Promedio</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {hoja.cursos.map((c, i) => (
                    <tr
                      key={`${c.cursoCodigo}-${c.seccion}`}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50"
                    >
                      <td className="px-4 py-2 text-neutral-400 font-medium">{i + 1}</td>
                      <td className="px-4 py-2">
                        <div className="font-semibold text-neutral-800 flex items-center gap-2">
                          {c.cursoNombre}
                          {c.estadoActa === 'ABIERTA' && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              Preliminar
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>
                            {c.cursoCodigo} · Sec. {c.seccion} · {c.docente}
                          </span>
                          {c.asignacionId && (
                            <>
                              <span className="text-neutral-300">·</span>
                              <button
                                type="button"
                                onClick={() => setSelectedAsignacionId(c.asignacionId)}
                                className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                              >
                                <BookOpen className="w-3 h-3" />
                                Ver Sílabo
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-neutral-600 font-medium">{c.creditos}</td>
                      <td className="px-3 py-2 text-center text-neutral-700">{nota(c.parcial1)}</td>
                      <td className="px-3 py-2 text-center text-neutral-700">{nota(c.parcial2)}</td>
                      <td className="px-3 py-2 text-center text-neutral-700">{nota(c.practicas)}</td>
                      <td className="px-3 py-2 text-center text-neutral-700">{nota(c.notaFinal)}</td>
                      <td
                        className={`px-3 py-2 text-center font-bold ${c.promedio === null
                            ? 'text-neutral-300'
                            : c.estado === 'APROBADO'
                              ? 'text-green-700'
                              : 'text-red-700'
                          }`}
                      >
                        {nota(c.promedio)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <EstadoCurso estado={c.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selectedAsignacionId !== null && (
        <SilaboModal
          isOpen={selectedAsignacionId !== null}
          onClose={() => setSelectedAsignacionId(null)}
          asignacionId={selectedAsignacionId}
          mode="read"
        />
      )}
    </div>
  )
}
