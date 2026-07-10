import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auditoriaApi, usuariosApi } from '@/api'
import type { LogAuditoria, PageResponse, UsuarioAdmin } from '@/types'
import { ChevronLeft, ChevronRight, Filter, ScrollText } from 'lucide-react'

const TAMANO_PAGINA = 20

export default function AuditoriaPage() {
  const [pagina, setPagina] = useState<PageResponse<LogAuditoria> | null>(null)
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [cargando, setCargando] = useState(true)

  const [usuarioId, setUsuarioId] = useState('')
  const [modulo, setModulo] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [page, setPage] = useState(0)

  const cargar = useCallback(() => {
    setCargando(true)
    auditoriaApi
      .listar({
        usuarioId: usuarioId ? Number(usuarioId) : undefined,
        modulo: modulo || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
        page,
        size: TAMANO_PAGINA,
      })
      .then(setPagina)
      .finally(() => setCargando(false))
  }, [usuarioId, modulo, desde, hasta, page])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    usuariosApi.listar().then(setUsuarios)
  }, [])

  function cambiarFiltro(setter: (v: string) => void) {
    return (valor: string) => {
      setter(valor)
      setPage(0)
    }
  }

  const logs = pagina?.content ?? []

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
            <ScrollText className="size-6 text-neutral-700" />
            Auditoría
          </h1>
          <p className="text-sm text-neutral-500">Registro de actividad de los usuarios del sistema</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-lg">Logs ({pagina?.totalElements ?? 0})</CardTitle>
                <CardDescription>Acciones registradas, de la más reciente a la más antigua</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="size-4 text-neutral-500 shrink-0" />
                <select
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  value={usuarioId}
                  onChange={(e) => cambiarFiltro(setUsuarioId)(e.target.value)}
                >
                  <option value="">Todos los usuarios</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombres} {u.apellidos}
                    </option>
                  ))}
                </select>
                <input
                  className="h-9 w-[140px] rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  placeholder="Módulo (ej. usuarios)"
                  value={modulo}
                  onChange={(e) => cambiarFiltro(setModulo)(e.target.value)}
                />
                <input
                  type="date"
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  value={desde}
                  onChange={(e) => cambiarFiltro(setDesde)(e.target.value)}
                />
                <span className="text-sm text-neutral-500">a</span>
                <input
                  type="date"
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  value={hasta}
                  onChange={(e) => cambiarFiltro(setHasta)(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <p className="text-sm text-neutral-500 py-8 text-center">Cargando...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-neutral-500 py-8 text-center">No hay registros de actividad.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-neutral-500">
                      <th className="py-2 pr-4 font-medium">Usuario</th>
                      <th className="py-2 pr-4 font-medium">Acción</th>
                      <th className="py-2 pr-4 font-medium">Módulo</th>
                      <th className="py-2 pr-4 font-medium">Fecha</th>
                      <th className="py-2 font-medium">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-neutral-100">
                        <td className="py-2 pr-4">
                          <p className="font-medium text-neutral-900">{log.usuarioNombre}</p>
                          <p className="text-xs text-neutral-500">{log.usuarioEmail}</p>
                        </td>
                        <td className="py-2 pr-4">
                          <p className="text-neutral-900">{log.accion}</p>
                          {log.detalle && <p className="text-xs text-neutral-500">{log.detalle}</p>}
                        </td>
                        <td className="py-2 pr-4 text-neutral-700">{log.modulo}</td>
                        <td className="py-2 pr-4 text-neutral-700 whitespace-nowrap">
                          {new Date(log.fecha).toLocaleString('es-PE')}
                        </td>
                        <td className="py-2">
                          <span
                            className={
                              log.resultado === 'EXITO'
                                ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                                : 'rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700'
                            }
                          >
                            {log.resultado === 'EXITO' ? 'Éxito' : 'Error'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagina && pagina.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  Página {pagina.number + 1} de {pagina.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={pagina.first} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="size-4" />
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" disabled={pagina.last} onClick={() => setPage(page + 1)}>
                    Siguiente
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
