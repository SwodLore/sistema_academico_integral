import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ESTADO_MATRICULA_LABELS, ESTADO_MATRICULA_VARIANTS, type CursoDisponible, type Matricula } from '@/types'

interface Props {
  matricula: Matricula
  cursos: CursoDisponible[]
  descargando: boolean
  onDescargar: () => void
}

export default function MatriculaEstadoCard({ matricula, cursos, descargando, onDescargar }: Props) {
  const totalCreditos = cursos.reduce((total, curso) => total + curso.creditos, 0)

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-900">Mi Matricula</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Solicitud {matricula.periodo?.codigo}</CardTitle>
            <Badge variant={ESTADO_MATRICULA_VARIANTS[matricula.estado]}>
              {ESTADO_MATRICULA_LABELS[matricula.estado]}
            </Badge>
          </div>
          <CardDescription>
            Enviada el{' '}
            {new Date(matricula.fechaSolicitud).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {matricula.estado === 'RECHAZADA' && matricula.observacion && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">Motivo: {matricula.observacion}</p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">Cursos solicitados</p>
            {cursos.map((curso) => (
              <div key={curso.cursoId} className="flex items-center justify-between border rounded-md px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {curso.codigo} - {curso.nombre}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {curso.docente} · Seccion {curso.seccion}
                  </p>
                </div>
                <span className="text-xs text-neutral-500">{curso.creditos} cred.</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-neutral-600">Total: {totalCreditos} creditos</p>

          <Button className="w-full" disabled={descargando} onClick={onDescargar}>
            {descargando ? 'Descargando...' : 'Descargar ficha (PDF)'}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
