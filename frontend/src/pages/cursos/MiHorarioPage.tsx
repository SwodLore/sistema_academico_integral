import { CalendarDays, Clock, MapPin, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCargaDocente } from '@/hooks/useCargaDocente'
import { DIA_SEMANA_LABELS } from '@/types/horario'

const DIAS = Object.keys(DIA_SEMANA_LABELS) as (keyof typeof DIA_SEMANA_LABELS)[]

export default function MiHorarioPage() {
  const { cargandoPeriodos, cargandoCarga, anio, semestre, carga } = useCargaDocente()

  if (cargandoPeriodos || cargandoCarga) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
        <p className="text-neutral-500 text-sm">Cargando horario...</p>
      </div>
    )
  }

  const bloquesPorDia = DIAS.map((dia) => ({
    dia,
    bloques: (carga?.cursos ?? [])
      .flatMap((curso) =>
        curso.horarios
          .filter((h) => h.dia === dia)
          .map((h) => ({ curso, horario: h }))
      )
      .sort((a, b) => a.horario.horaInicio.localeCompare(b.horario.horaInicio)),
  })).filter((d) => d.bloques.length > 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
          <CalendarDays className="size-6 text-neutral-700" />
          Mi Horario
        </h1>
        <p className="text-sm text-neutral-500">
          Horario semanal de clases · Periodo {anio}-{semestre}
        </p>
      </div>

      {bloquesPorDia.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-neutral-500 py-8 text-center">
              No tienes horarios registrados en este periodo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bloquesPorDia.map(({ dia, bloques }) => (
            <Card key={dia}>
              <CardHeader>
                <CardTitle className="text-base">{DIA_SEMANA_LABELS[dia]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bloques.map(({ curso, horario }, i) => (
                  <div key={i} className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <p className="text-sm font-medium text-neutral-900">
                      {curso.codigo} - {curso.nombre}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-neutral-400" />
                        {horario.horaInicio.substring(0, 5)} - {horario.horaFin.substring(0, 5)}
                      </span>
                      {horario.aula && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-neutral-400" />
                          Aula {horario.aula}
                        </span>
                      )}
                      <span>Sección {curso.seccion}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
