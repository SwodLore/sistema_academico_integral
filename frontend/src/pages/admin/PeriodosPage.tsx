import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CalendarRange, Plus, Check, DoorOpen, DoorClosed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { periodosApi, type PeriodoPayload } from '@/api/periodos'
import { getApiError } from '@/lib/apiError'
import type { PeriodoAcademico } from '@/types'

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const anioActual = new Date().getFullYear()
  const [form, setForm] = useState<PeriodoPayload>({ anio: anioActual, semestre: 'I', fechaInicio: '', fechaFin: '' })

  async function cargar() {
    setCargando(true)
    try {
      setPeriodos(await periodosApi.listar())
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function crear() {
    setProcesando(true)
    try {
      await periodosApi.crear({
        anio: form.anio,
        semestre: form.semestre,
        fechaInicio: form.fechaInicio || undefined,
        fechaFin: form.fechaFin || undefined,
      })
      toast.success('Periodo creado')
      setModalAbierto(false)
      await cargar()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setProcesando(false)
    }
  }

  async function activar(p: PeriodoAcademico) {
    setProcesando(true)
    try {
      await periodosApi.activar(p.id)
      toast.success(`${p.codigo} es ahora el periodo activo`)
      await cargar()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setProcesando(false)
    }
  }

  async function cambiarMatricula(p: PeriodoAcademico, abierta: boolean) {
    setProcesando(true)
    try {
      await periodosApi.matricula(p.id, abierta)
      toast.success(abierta ? 'Matrícula abierta' : 'Matrícula cerrada')
      await cargar()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
              <CalendarRange className="size-6 text-neutral-700" />
              Periodos Académicos
            </h1>
            <p className="text-sm text-neutral-500">Crea semestres, define el periodo activo y abre o cierra la matrícula</p>
          </div>
          <Button className="gap-2 self-start sm:self-auto" onClick={() => setModalAbierto(true)}>
            <Plus className="size-4" />
            Nuevo periodo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Listado</CardTitle>
            <CardDescription>Solo un periodo puede estar activo a la vez</CardDescription>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <p className="text-sm text-neutral-500 py-8 text-center">Cargando...</p>
            ) : periodos.length === 0 ? (
              <p className="text-sm text-neutral-500 py-8 text-center">No hay periodos registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-neutral-500">
                      <th className="py-2 pr-4 font-medium">Periodo</th>
                      <th className="py-2 pr-4 font-medium">Fechas</th>
                      <th className="py-2 pr-4 font-medium">Estado</th>
                      <th className="py-2 pr-4 font-medium">Matrícula</th>
                      <th className="py-2 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodos.map((p) => (
                      <tr key={p.id} className="border-b border-neutral-100">
                        <td className="py-3 pr-4 font-semibold text-neutral-900">{p.codigo}</td>
                        <td className="py-3 pr-4 text-neutral-600 text-xs">
                          {p.fechaInicio ?? '—'} a {p.fechaFin ?? '—'}
                        </td>
                        <td className="py-3 pr-4">
                          {p.activo ? (
                            <Badge variant="success">Activo</Badge>
                          ) : (
                            <Badge variant="default">Inactivo</Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {p.matriculaAbierta ? (
                            <Badge variant="info">Abierta</Badge>
                          ) : (
                            <span className="text-xs text-neutral-400">Cerrada</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {!p.activo && (
                              <Button variant="outline" size="sm" className="gap-1.5" disabled={procesando} onClick={() => activar(p)}>
                                <Check className="size-3.5" />
                                Activar
                              </Button>
                            )}
                            {p.matriculaAbierta ? (
                              <Button variant="outline" size="sm" className="gap-1.5 text-red-600" disabled={procesando} onClick={() => cambiarMatricula(p, false)}>
                                <DoorClosed className="size-3.5" />
                                Cerrar matrícula
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="gap-1.5" disabled={procesando || !p.activo} onClick={() => cambiarMatricula(p, true)}>
                                <DoorOpen className="size-3.5" />
                                Abrir matrícula
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalAbierto} onOpenChange={(a) => !a && !procesando && setModalAbierto(false)}>
        <DialogContent>
          <DialogTitle>Nuevo periodo académico</DialogTitle>
          <DialogDescription>Se crea inactivo y con la matrícula cerrada. Actívalo desde el listado.</DialogDescription>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Año</label>
                <input
                  type="number"
                  min={2000}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: e.target.value ? Number(e.target.value) : anioActual })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Semestre</label>
                <select
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                  value={form.semestre}
                  onChange={(e) => setForm({ ...form, semestre: e.target.value })}
                >
                  <option value="I">I</option>
                  <option value="II">II</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Inicio (opcional)</label>
                <input
                  type="date"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                  value={form.fechaInicio}
                  onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Fin (opcional)</label>
                <input
                  type="date"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                  value={form.fechaFin}
                  onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button variant="outline" disabled={procesando} onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button disabled={procesando} onClick={crear}>
                {procesando ? 'Creando...' : 'Crear periodo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
