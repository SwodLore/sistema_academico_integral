import { useState } from 'react'
import { useHistorial } from '@/hooks/useHistorial'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SilaboModal from '@/components/SilaboModal'
import { BookOpen, CheckCircle2, XCircle, RefreshCw, FileText, GraduationCap } from 'lucide-react'
import type { HistorialSemestre, NotaCurso } from '@/types'

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

function SemestreCard({
  semestre,
  onVerSilabo,
}: {
  semestre: HistorialSemestre
  onVerSilabo: (asignacionId: number) => void
}) {
  const promAprobado = semestre.promedioSemestre != null && semestre.promedioSemestre >= NOTA_MINIMA
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            {semestre.periodo}
            <Badge variant="info" className="text-[10px] font-bold uppercase tracking-wider">
              Semestre {semestre.semestre}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span>{semestre.creditos} créd.</span>
            <span className="text-green-700 font-semibold">{semestre.aprobados} aprob.</span>
            <span className="text-red-700 font-semibold">{semestre.desaprobados} desaprob.</span>
            <span>
              Prom.{' '}
              <b className={semestre.promedioSemestre == null ? 'text-neutral-400' : promAprobado ? 'text-green-700' : 'text-red-700'}>
                {semestre.promedioSemestre == null ? '-' : semestre.promedioSemestre.toFixed(2)}
              </b>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                <th className="px-4 py-2.5 font-semibold text-neutral-600">Curso</th>
                <th className="px-3 py-2.5 font-semibold text-neutral-600 text-center">Créd.</th>
                <th className="px-2 py-2.5 font-semibold text-neutral-600 text-center">P1</th>
                <th className="px-2 py-2.5 font-semibold text-neutral-600 text-center">P2</th>
                <th className="px-2 py-2.5 font-semibold text-neutral-600 text-center">Prác.</th>
                <th className="px-2 py-2.5 font-semibold text-neutral-600 text-center">Final</th>
                <th className="px-3 py-2.5 font-semibold text-neutral-600 text-center">Prom.</th>
                <th className="px-4 py-2.5 font-semibold text-neutral-600 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {semestre.cursos.map((c) => (
                <tr key={`${c.cursoCodigo}-${c.seccion}`} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                  <td className="px-4 py-2">
                    <div className="font-semibold text-neutral-800">{c.cursoNombre}</div>
                    <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>{c.cursoCodigo} · Sec. {c.seccion}</span>
                      {c.asignacionId && (
                        <>
                          <span className="text-neutral-300">·</span>
                          <button
                            type="button"
                            onClick={() => onVerSilabo(c.asignacionId)}
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
                  <td className="px-2 py-2 text-center text-neutral-700">{nota(c.parcial1)}</td>
                  <td className="px-2 py-2 text-center text-neutral-700">{nota(c.parcial2)}</td>
                  <td className="px-2 py-2 text-center text-neutral-700">{nota(c.practicas)}</td>
                  <td className="px-2 py-2 text-center text-neutral-700">{nota(c.notaFinal)}</td>
                  <td className={`px-3 py-2 text-center font-bold ${
                    c.promedio === null ? 'text-neutral-300' : c.estado === 'APROBADO' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {nota(c.promedio)}
                  </td>
                  <td className="px-4 py-2 text-center"><EstadoCurso estado={c.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RecordPage() {
  const { cargando, historial } = useHistorial()
  const [silaboAsignacionId, setSilaboAsignacionId] = useState<number | null>(null)

  if (cargando) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
        <p className="text-neutral-500 text-sm">Cargando tu historial académico...</p>
      </div>
    )
  }

  if (!historial) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500">No se pudo cargar tu historial académico.</p>
      </div>
    )
  }

  const ppaAprobado =
    historial.promedioPonderadoAcumulado != null && historial.promedioPonderadoAcumulado >= NOTA_MINIMA
  const avance =
    historial.creditosCarrera > 0
      ? Math.min(100, Math.round((historial.creditosAprobados / historial.creditosCarrera) * 100))
      : 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-neutral-400" />
          Récord Académico
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {historial.estudianteNombre} · {historial.estudianteCodigo} · {historial.especialidad} · Ciclo {historial.cicloActual}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Promedio ponderado acumulado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-extrabold ${
              historial.promedioPonderadoAcumulado == null ? 'text-neutral-400' : ppaAprobado ? 'text-green-600' : 'text-red-600'
            }`}>
              {historial.promedioPonderadoAcumulado == null ? '-' : historial.promedioPonderadoAcumulado.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Créditos aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-neutral-900">
              {historial.creditosAprobados}
              <span className="text-base font-semibold text-neutral-400">/{historial.creditosCarrera}</span>
              <span className="ml-2 text-sm font-bold text-blue-600">{avance}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${avance}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Cursos aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-green-600">
              {historial.cursosAprobados}
              <span className="text-base font-semibold text-neutral-400">/{historial.totalCursos}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Semestres (mas reciente primero) */}
      {historial.semestres.length === 0 ? (
        <Card className="border-dashed border-2 border-neutral-300 py-12 text-center">
          <CardContent>
            <GraduationCap className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">
              Aún no tienes semestres cursados con matrícula confirmada.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {historial.semestres.map((sem) => (
            <SemestreCard key={sem.periodo} semestre={sem} onVerSilabo={setSilaboAsignacionId} />
          ))}
        </div>
      )}

      {silaboAsignacionId !== null && (
        <SilaboModal
          isOpen={silaboAsignacionId !== null}
          onClose={() => setSilaboAsignacionId(null)}
          asignacionId={silaboAsignacionId}
          mode="read"
        />
      )}
    </div>
  )
}
