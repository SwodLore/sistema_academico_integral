import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, ClipboardList, Lock, RefreshCw, Save, XCircle } from 'lucide-react'

interface NotaEstudiante {
  detalleId: number
  notaId: number | null
  codigoEstudiante: string
  nombreCompleto: string
  parcial1: number | null
  parcial2: number | null
  practicas: number | null
  notaFinal: number | null
  promedio: number | null
  estado: 'PENDIENTE' | 'APROBADO' | 'DESAPROBADO'
}

interface ActaNotas {
  asignacionId: number
  cursoCodigo: string
  cursoNombre: string
  seccion: string
  periodo: string
  estadoActa: 'ABIERTA' | 'CERRADA' | 'VALIDADA'
  editable: boolean
  pesoParcial1: number
  pesoParcial2: number
  pesoPracticas: number
  pesoNotaFinal: number
  totalEstudiantes: number
  aprobados: number
  desaprobados: number
  pendientes: number
  estudiantes: NotaEstudiante[]
}

type CampoNota = 'parcial1' | 'parcial2' | 'practicas' | 'notaFinal'

type FilaEdicion = Record<CampoNota, string>

const NOTA_MINIMA = 10.5

function getMensajeError(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } }
  return error.response?.data?.message ?? 'Ocurrió un error'
}

function aTexto(valor: number | null): string {
  return valor === null || valor === undefined ? '' : String(valor)
}

function aNumero(texto: string): number | null {
  const t = texto.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isNaN(n) ? null : n
}

export default function RegistrarNotasPage() {
  const { asignacionId } = useParams<{ asignacionId: string }>()
  const navigate = useNavigate()

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [acta, setActa] = useState<ActaNotas | null>(null)
  const [filas, setFilas] = useState<Record<number, FilaEdicion>>({})

  async function cargarActa() {
    setCargando(true)
    try {
      const res = await api.get<ActaNotas>(`/docentes/asignaciones/${asignacionId}/acta`)
      setActa(res.data)
      const iniciales: Record<number, FilaEdicion> = {}
      for (const e of res.data.estudiantes) {
        iniciales[e.detalleId] = {
          parcial1: aTexto(e.parcial1),
          parcial2: aTexto(e.parcial2),
          practicas: aTexto(e.practicas),
          notaFinal: aTexto(e.notaFinal),
        }
      }
      setFilas(iniciales)
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarActa()
  }, [asignacionId])

  const pesos = acta
    ? {
        parcial1: acta.pesoParcial1,
        parcial2: acta.pesoParcial2,
        practicas: acta.pesoPracticas,
        notaFinal: acta.pesoNotaFinal,
      }
    : { parcial1: 0, parcial2: 0, practicas: 0, notaFinal: 0 }

  // Calcula promedio y estado en vivo para una fila
  function calcular(fila: FilaEdicion): { promedio: number | null; estado: NotaEstudiante['estado'] } {
    const p1 = aNumero(fila.parcial1)
    const p2 = aNumero(fila.parcial2)
    const pr = aNumero(fila.practicas)
    const nf = aNumero(fila.notaFinal)
    if (p1 === null || p2 === null || pr === null || nf === null) {
      return { promedio: null, estado: 'PENDIENTE' }
    }
    const promedio =
      (p1 * pesos.parcial1 + p2 * pesos.parcial2 + pr * pesos.practicas + nf * pesos.notaFinal) / 100
    const redondeado = Math.round(promedio * 100) / 100
    return { promedio: redondeado, estado: redondeado >= NOTA_MINIMA ? 'APROBADO' : 'DESAPROBADO' }
  }

  function handleChange(detalleId: number, campo: CampoNota, valor: string) {
    // Solo numeros con hasta 2 decimales
    if (valor !== '' && !/^\d{0,2}(\.\d{0,2})?$/.test(valor)) return
    const num = aNumero(valor)
    if (num !== null && num > 20) return
    setFilas((prev) => ({
      ...prev,
      [detalleId]: { ...prev[detalleId], [campo]: valor },
    }))
  }

  // Resumen recalculado en vivo
  const resumen = useMemo(() => {
    if (!acta) return { aprobados: 0, desaprobados: 0, pendientes: 0 }
    let aprobados = 0
    let desaprobados = 0
    let pendientes = 0
    for (const e of acta.estudiantes) {
      const { estado } = calcular(filas[e.detalleId] ?? { parcial1: '', parcial2: '', practicas: '', notaFinal: '' })
      if (estado === 'APROBADO') aprobados++
      else if (estado === 'DESAPROBADO') desaprobados++
      else pendientes++
    }
    return { aprobados, desaprobados, pendientes }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acta, filas])

  async function handleGuardar() {
    if (!acta) return
    const notas = acta.estudiantes.map((e) => {
      const fila = filas[e.detalleId]
      return {
        detalleId: e.detalleId,
        parcial1: aNumero(fila.parcial1),
        parcial2: aNumero(fila.parcial2),
        practicas: aNumero(fila.practicas),
        notaFinal: aNumero(fila.notaFinal),
      }
    })
    setGuardando(true)
    try {
      const res = await api.put<ActaNotas>(`/docentes/asignaciones/${asignacionId}/notas`, { notas })
      setActa(res.data)
      toast.success('Notas guardadas correctamente')
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
        <p className="text-neutral-500 text-sm">Cargando acta de notas...</p>
      </div>
    )
  }

  if (!acta) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500">No se pudo cargar el acta de notas.</p>
        <Button variant="outline" className="mt-4 gap-2" onClick={() => navigate('/cursos')}>
          <ArrowLeft className="w-4 h-4" /> Volver a mis cursos
        </Button>
      </div>
    )
  }

  const editable = acta.editable

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <button
        onClick={() => navigate('/cursos')}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a mis cursos
      </button>

      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-800">
              {acta.cursoCodigo}
            </span>
            <Badge variant="success" className="text-[10px] font-bold uppercase tracking-wider">
              Sec. {acta.seccion}
            </Badge>
            <span className="text-xs text-neutral-400 font-medium">{acta.periodo}</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-neutral-400" />
            {acta.cursoNombre}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Registra las notas de tus estudiantes. El promedio y el estado se calculan automáticamente.
          </p>
        </div>

        <div className="flex-shrink-0">
          {editable ? (
            <Button onClick={handleGuardar} disabled={guardando} className="gap-2">
              {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Notas
            </Button>
          ) : (
            <Badge variant="warning" className="gap-1.5 py-1.5">
              <Lock className="w-3.5 h-3.5" /> Acta {acta.estadoActa.toLowerCase()}
            </Badge>
          )}
        </div>
      </div>

      {!editable && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            El acta de este curso está <b>{acta.estadoActa.toLowerCase()}</b>. Las notas son de solo lectura y no
            pueden modificarse.
          </span>
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-neutral-900">{acta.totalEstudiantes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-green-600">{resumen.aprobados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Desaprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-red-600">{resumen.desaprobados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-neutral-400">{resumen.pendientes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Formula */}
      <p className="mb-3 text-xs text-neutral-500">
        <b>Promedio final</b> = Parcial 1 ({pesos.parcial1}%) + Parcial 2 ({pesos.parcial2}%) + Prácticas (
        {pesos.practicas}%) + Examen Final ({pesos.notaFinal}%). Aprobado con nota ≥ {NOTA_MINIMA}.
      </p>

      {/* Tabla */}
      {acta.estudiantes.length === 0 ? (
        <Card className="border-dashed border-2 border-neutral-300 py-12 text-center">
          <CardContent>
            <p className="text-sm text-neutral-500">No hay estudiantes matriculados en este curso.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-600">#</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Estudiante</th>
                <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Parcial 1</th>
                <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Parcial 2</th>
                <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Prácticas</th>
                <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Ex. Final</th>
                <th className="px-3 py-3 font-semibold text-neutral-600 text-center">Promedio</th>
                <th className="px-4 py-3 font-semibold text-neutral-600 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {acta.estudiantes.map((e, i) => {
                const fila = filas[e.detalleId] ?? { parcial1: '', parcial2: '', practicas: '', notaFinal: '' }
                const { promedio, estado } = calcular(fila)
                const campos: CampoNota[] = ['parcial1', 'parcial2', 'practicas', 'notaFinal']
                return (
                  <tr key={e.detalleId} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                    <td className="px-4 py-2 text-neutral-400 font-medium">{i + 1}</td>
                    <td className="px-4 py-2">
                      <div className="font-semibold text-neutral-800">{e.nombreCompleto}</div>
                      <div className="text-xs text-neutral-400">{e.codigoEstudiante}</div>
                    </td>
                    {campos.map((campo) => (
                      <td key={campo} className="px-3 py-2 text-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={fila[campo]}
                          disabled={!editable}
                          onChange={(ev) => handleChange(e.detalleId, campo, ev.target.value)}
                          placeholder="-"
                          className="w-16 text-center rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm font-medium text-neutral-900 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 disabled:bg-neutral-100 disabled:text-neutral-500"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-bold text-neutral-900">
                      {promedio !== null ? promedio.toFixed(2) : <span className="text-neutral-300">-</span>}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {estado === 'APROBADO' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="w-4 h-4" /> Aprobado
                        </span>
                      )}
                      {estado === 'DESAPROBADO' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                          <XCircle className="w-4 h-4" /> Desaprobado
                        </span>
                      )}
                      {estado === 'PENDIENTE' && (
                        <span className="text-xs font-medium text-neutral-400">Pendiente</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editable && acta.estudiantes.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleGuardar} disabled={guardando} className="gap-2">
            {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Notas
          </Button>
        </div>
      )}
    </div>
  )
}
