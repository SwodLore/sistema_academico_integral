import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, Clock, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCargaDocente } from '@/hooks/useCargaDocente'
import CursoAsignadoCard from './components/CursoAsignadoCard'
import SilaboModal from '@/components/SilaboModal'

export default function CursosPage() {
  const navigate = useNavigate()
  const {
    cargandoPeriodos,
    cargandoCarga,
    anio,
    semestre,
    carga,
    aniosDisponibles,
    semestresDisponibles,
    cambiarAnio,
    setSemestre,
  } = useCargaDocente()

  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(null)

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
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Mis Cursos Asignados</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Visualiza tu carga académica, secciones asignadas, horarios y aulas.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Año</label>
            <select
              value={anio}
              onChange={(e) => cambiarAnio(e.target.value ? Number(e.target.value) : '')}
              className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-md focus:ring-neutral-500 focus:border-neutral-500 block p-1.5 font-medium cursor-pointer"
            >
              {aniosDisponibles.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="h-8 w-px bg-neutral-200 self-end" />

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Semestre</label>
            <select
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-md focus:ring-neutral-500 focus:border-neutral-500 block p-1.5 font-medium cursor-pointer"
            >
              {semestresDisponibles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {carga && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ResumenCard titulo="Total Créditos" valor={carga.totalCreditos} nota="Créditos lectivos asignados" icono={BookOpen} />
          <ResumenCard titulo="Horas Semanales" valor={`${carga.totalHoras} hrs`} nota="Horas totales de dictado semanal" icono={Clock} />
          <ResumenCard titulo="Cursos Asignados" valor={carga.cursos.length} nota="Secciones a cargo en este periodo" icono={Calendar} />
        </div>
      )}

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
            <CursoAsignadoCard
              key={`${curso.cursoId}-${curso.seccion}`}
              curso={curso}
              onRegistrarNotas={() => navigate(`/cursos/${curso.asignacionId}/notas`)}
              onVerSilabo={() => setSelectedAsignacionId(curso.asignacionId)}
            />
          ))}
        </div>
      )}

      {selectedAsignacionId !== null && (
        <SilaboModal
          isOpen={selectedAsignacionId !== null}
          onClose={() => setSelectedAsignacionId(null)}
          asignacionId={selectedAsignacionId}
          mode="edit"
        />
      )}
    </div>
  )
}

interface ResumenCardProps {
  titulo: string
  valor: string | number
  nota: string
  icono: typeof BookOpen
}

function ResumenCard({ titulo, valor, nota, icono: Icono }: ResumenCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">{titulo}</CardTitle>
        <Icono className="w-5 h-5 text-neutral-400" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold text-neutral-900">{valor}</div>
        <p className="text-xs text-neutral-400 mt-1">{nota}</p>
      </CardContent>
    </Card>
  )
}
