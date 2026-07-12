import { BookOpen, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ESTADO_MATRICULA_LABELS, ESTADO_MATRICULA_VARIANTS, type CursoDisponible, type Matricula } from '@/types'
import RegistrarPagoForm from '@/pages/admin/components/RegistrarPagoForm'

interface Props {
  matricula: Matricula
  cursos: CursoDisponible[]
  descargando: boolean
  enviando: boolean
  onDescargar: () => void
  onSubirVoucher: (datos: FormData) => void
  onVerSilabo?: (asignacionId: number) => void
}

export default function MatriculaEstadoCard({
  matricula,
  cursos,
  descargando,
  enviando,
  onDescargar,
  onSubirVoucher,
  onVerSilabo,
}: Props) {
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
                  <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                    <span>{curso.docente} · Seccion {curso.seccion}</span>
                    {curso.asignacionId && onVerSilabo && (
                      <>
                        <span className="text-neutral-300">·</span>
                        <button
                          type="button"
                          onClick={() => onVerSilabo(curso.asignacionId!)}
                          className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" />
                          Ver Sílabo
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs text-neutral-500">{curso.creditos} cred.</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-neutral-600">Total: {totalCreditos} creditos</p>

          {matricula.estado === 'PENDIENTE' && (
            <div>
              <p className="text-sm text-amber-700 bg-amber-50 rounded-md p-3">
                Tu solicitud fue reservada. Para completar tu matricula, sube el voucher de tu pago y
                espera la validacion del administrador.
              </p>
              <RegistrarPagoForm
                procesando={enviando}
                onRegistrar={onSubirVoucher}
                titulo="Subir voucher de pago"
                textoBoton="Enviar pago"
              />
            </div>
          )}

          {matricula.estado === 'PAGADA' && (
            <p className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-md p-3">
              <Clock className="size-4 shrink-0" />
              Tu pago fue enviado y esta siendo revisado por el administrador. Cuando lo valide, podras
              descargar tu ficha oficial aqui.
            </p>
          )}

          {matricula.estado === 'MATRICULADO' && (
            <div className="space-y-2">
              {matricula.numeroFicha && (
                <p className="text-sm text-green-700 bg-green-50 rounded-md p-3">
                  Matricula validada. Ficha oficial: <span className="font-semibold">{matricula.numeroFicha}</span>
                </p>
              )}
              <Button className="w-full" disabled={descargando} onClick={onDescargar}>
                {descargando ? 'Descargando...' : 'Descargar ficha oficial (PDF)'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
