import { BookOpen, ClipboardList, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DIA_SEMANA_LABELS, type CursoAsignado, type DiaSemana } from '@/types'

interface Props {
  curso: CursoAsignado
  onRegistrarNotas: () => void
  onVerSilabo: () => void
}

export default function CursoAsignadoCard({ curso, onRegistrarNotas, onVerSilabo }: Props) {
  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-neutral-200 hover:shadow-md hover:border-neutral-300 transition-all bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-800">
              {curso.codigo}
            </span>
            <CardTitle className="text-lg font-bold text-neutral-900 leading-tight">{curso.nombre}</CardTitle>
          </div>
          <Badge variant="success" className="text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider flex-shrink-0">
            Sec. {curso.seccion}
          </Badge>
        </div>
        <CardDescription className="flex gap-4 mt-2">
          <span className="flex items-center text-xs text-neutral-500 font-medium">
            <BookOpen className="w-3.5 h-3.5 mr-1 text-neutral-400" />
            {curso.creditos} Créditos
          </span>
          <span className="flex items-center text-xs text-neutral-500 font-medium">
            <Clock className="w-3.5 h-3.5 mr-1 text-neutral-400" />
            {curso.horasSemanales} hrs/semana
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 border-t border-neutral-100 bg-neutral-50/50 flex-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Horarios y Aulas</h4>
        {curso.horarios.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">No hay horarios registrados.</p>
        ) : (
          <div className="space-y-2">
            {curso.horarios.map((h, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2.5 rounded-md border border-neutral-100 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                    {DIA_SEMANA_LABELS[h.dia as DiaSemana] ?? h.dia}
                  </span>
                  <span className="text-xs font-semibold text-neutral-600">
                    {h.horaInicio} - {h.horaFin}
                  </span>
                </div>
                {h.aula && (
                  <div className="flex items-center gap-1 text-xs font-medium text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200/60 self-start sm:self-auto">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Aula: {h.aula}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1 gap-2 border-neutral-300 hover:bg-neutral-100" onClick={onVerSilabo}>
            <BookOpen className="w-4 h-4 text-neutral-500" />
            Gestionar Sílabo
          </Button>
          <Button className="flex-1 gap-2" onClick={onRegistrarNotas}>
            <ClipboardList className="w-4 h-4" />
            Registrar Notas
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
