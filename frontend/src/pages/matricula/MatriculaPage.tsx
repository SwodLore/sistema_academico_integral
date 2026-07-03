import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ESTADO_MATRICULA_LABELS, type EstadoMatricula, type Matricula } from '@/types'

interface CursoDisponible {
  cursoId: number
  codigo: string
  nombre: string
  creditos: number
  docente: string
  seccion: string
  horarios: string[]
}

interface CursosDisponibles {
  ciclo: number
  anio: number
  semestre: string
  maxCreditos: number
  cursos: CursoDisponible[]
}

interface MiMatricula {
  matricula?: Matricula
  cursos?: CursoDisponible[]
}

const ESTADO_VARIANTS: Record<EstadoMatricula, 'warning' | 'info' | 'destructive' | 'success'> = {
  PENDIENTE: 'warning',
  VALIDADA: 'info',
  RECHAZADA: 'destructive',
  PAGADA: 'success',
  MATRICULADO: 'success',
}

function getMensajeError(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } }
  return error.response?.data?.message ?? 'Ocurrio un error, intenta de nuevo'
}

export default function MatriculaPage() {
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [matricula, setMatricula] = useState<Matricula | null>(null)
  const [cursosMatricula, setCursosMatricula] = useState<CursoDisponible[]>([])
  const [oferta, setOferta] = useState<CursosDisponibles | null>(null)
  const [seleccionados, setSeleccionados] = useState<number[]>([])

  useEffect(() => {
    async function cargar() {
      try {
        const res = await api.get<MiMatricula>('/matriculas/mi-matricula')
        if (res.data.matricula) {
          setMatricula(res.data.matricula)
          setCursosMatricula(res.data.cursos ?? [])
        } else {
          const oferta = await api.get<CursosDisponibles>('/matriculas/cursos-disponibles')
          setOferta(oferta.data)
        }
      } catch (err) {
        toast.error(getMensajeError(err))
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const creditosSeleccionados = oferta
    ? oferta.cursos
        .filter((c) => seleccionados.includes(c.cursoId))
        .reduce((total, c) => total + c.creditos, 0)
    : 0

  const excedeCreditos = oferta ? creditosSeleccionados > oferta.maxCreditos : false

  function toggleCurso(cursoId: number) {
    setSeleccionados((prev) =>
      prev.includes(cursoId) ? prev.filter((id) => id !== cursoId) : [...prev, cursoId]
    )
  }

  async function enviarSolicitud() {
    if (!oferta) return
    setEnviando(true)
    try {
      const res = await api.post<Matricula>('/matriculas/solicitar', {
        ciclo: oferta.ciclo,
        anio: oferta.anio,
        semestre: oferta.semestre,
        cursosIds: seleccionados,
      })
      setMatricula(res.data)
      setCursosMatricula(oferta.cursos.filter((c) => seleccionados.includes(c.cursoId)))
      toast.success('Solicitud de matricula enviada')
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500">Cargando...</p>
      </div>
    )
  }

  if (matricula) {
    return (
      <div className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-neutral-900">Mi Matricula</h1>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Solicitud {matricula.periodo?.codigo}
                </CardTitle>
                <Badge variant={ESTADO_VARIANTS[matricula.estado]}>
                  {ESTADO_MATRICULA_LABELS[matricula.estado]}
                </Badge>
              </div>
              <CardDescription>
                Enviada el {new Date(matricula.fechaSolicitud).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {matricula.estado === 'RECHAZADA' && matricula.observacion && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">
                  Motivo: {matricula.observacion}
                </p>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-700">Cursos solicitados</p>
                {cursosMatricula.map((curso) => (
                  <div
                    key={curso.cursoId}
                    className="flex items-center justify-between border rounded-md px-3 py-2"
                  >
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

              <p className="text-sm text-neutral-600">
                Total: {cursosMatricula.reduce((t, c) => t + c.creditos, 0)} creditos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Solicitud de Matricula</h1>
          <p className="text-sm text-neutral-500">
            Periodo {oferta?.anio}-{oferta?.semestre} · Ciclo {oferta?.ciclo}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Cursos disponibles</CardTitle>
                <CardDescription>Selecciona los cursos que vas a llevar</CardDescription>
              </div>
              <span
                className={`text-sm font-medium ${excedeCreditos ? 'text-red-600' : 'text-neutral-700'}`}
              >
                {creditosSeleccionados} / {oferta?.maxCreditos} creditos
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {oferta && oferta.cursos.length === 0 && (
              <p className="text-sm text-neutral-500">
                No hay cursos disponibles para tu ciclo en este periodo.
              </p>
            )}

            {oferta?.cursos.map((curso) => (
              <label
                key={curso.cursoId}
                className={`flex items-start gap-3 border rounded-md px-3 py-3 cursor-pointer transition-colors ${
                  seleccionados.includes(curso.cursoId)
                    ? 'border-neutral-900 bg-neutral-100'
                    : 'hover:bg-neutral-50'
                }`}
              >
                <Checkbox
                  className="mt-1"
                  checked={seleccionados.includes(curso.cursoId)}
                  onCheckedChange={() => toggleCurso(curso.cursoId)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-900">
                      {curso.codigo} - {curso.nombre}
                    </p>
                    <span className="text-xs text-neutral-500">{curso.creditos} cred.</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {curso.docente} · Seccion {curso.seccion}
                  </p>
                  {curso.horarios.length > 0 && (
                    <p className="text-xs text-neutral-400">{curso.horarios.join(' | ')}</p>
                  )}
                </div>
              </label>
            ))}

            {excedeCreditos && (
              <p className="text-xs text-red-600">
                Superaste el limite de creditos permitido.
              </p>
            )}

            <Button
              className="w-full"
              disabled={enviando || seleccionados.length === 0 || excedeCreditos}
              onClick={enviarSolicitud}
            >
              {enviando ? 'Enviando...' : 'Enviar solicitud de matricula'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
