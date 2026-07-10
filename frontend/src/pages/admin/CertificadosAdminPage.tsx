import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { certificadosApi, SERVER_ORIGIN } from '@/api'
import { getApiError } from '@/lib/apiError'
import { toast } from 'sonner'
import type { SolicitudDocumento, EstadoSolicitud } from '@/types'
import { TIPO_DOCUMENTO_LABELS, ESTADO_SOLICITUD_LABELS } from '@/types/solicitudDocumento'
import { 
  Search, 
  Check, 
  X, 
  Award, 
  Calendar, 
  FileCheck
} from 'lucide-react'

export default function CertificadosAdminPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudDocumento[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS')
  const [searchQuery, setSearchQuery] = useState('')
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  const cargarTodas = async () => {
    try {
      const data = await certificadosApi.listarTodas()
      setSolicitudes(data)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarTodas()
  }, [])

  // Process request state transitions
  const handleProcesar = async (id: number, estado: EstadoSolicitud) => {
    setProcesandoId(id)
    try {
      await certificadosApi.procesarSolicitud(id, { estado })
      toast.success(`Solicitud actualizada a: ${ESTADO_SOLICITUD_LABELS[estado]}`)
      cargarTodas()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setProcesandoId(null)
    }
  }

  // Filter requests
  const solicitudesFiltradas = useMemo(() => {
    let list = solicitudes

    if (filtroEstado !== 'TODAS') {
      list = list.filter((s) => s.estado === filtroEstado)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) =>
          s.estudiante.usuario.nombres.toLowerCase().includes(q) ||
          s.estudiante.usuario.apellidos.toLowerCase().includes(q) ||
          s.estudiante.codigoEstudiante.toLowerCase().includes(q)
      )
    }

    return list
  }, [solicitudes, filtroEstado, searchQuery])

  // KPIs
  const stats = useMemo(() => {
    const total = solicitudes.length
    const pendientes = solicitudes.filter((s) => s.estado === 'PENDIENTE').length
    const autorizadas = solicitudes.filter((s) => s.estado === 'AUTORIZADA').length
    const emitidas = solicitudes.filter((s) => s.estado === 'LISTO').length
    return { total, pendientes, autorizadas, emitidas }
  }, [solicitudes])

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-neutral-500" />
            Gestión de Certificados
          </h1>
          <p className="text-sm text-neutral-500">
            Administra, autoriza y emite certificados y constancias en línea solicitadas por estudiantes.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Total Solicitudes</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="text-2xl font-extrabold text-neutral-900">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-amber-600">Pendientes</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="text-2xl font-extrabold text-amber-600">{stats.pendientes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-blue-600">Autorizadas</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="text-2xl font-extrabold text-blue-600">{stats.autorizadas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-green-600">Emitidas</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="text-2xl font-extrabold text-green-600">{stats.emitidas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar and Search */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="TODAS">Todos los Estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="AUTORIZADA">Autorizadas (Pendientes de Emisión)</option>
                <option value="LISTO">Listos / Emitidos</option>
                <option value="RECHAZADA">Rechazadas</option>
              </select>
            </div>

            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por estudiante o código..."
                className="pl-9 h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {cargando ? (
              <div className="text-center py-16">
                <p className="text-sm text-neutral-500">Cargando solicitudes de certificados...</p>
              </div>
            ) : solicitudesFiltradas.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">No se encontraron solicitudes con los criterios indicados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                      <th className="px-4 py-3.5 font-semibold text-neutral-600">Estudiante</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600">Documento</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600">Fecha Solicitud</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600">Motivo</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600 text-center">Estado</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudesFiltradas.map((solicitud) => {
                      const fecha = new Date(solicitud.fechaSolicitud).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })

                      let badge = <Badge variant="default">{ESTADO_SOLICITUD_LABELS[solicitud.estado]}</Badge>
                      if (solicitud.estado === 'PENDIENTE') {
                        badge = <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">{ESTADO_SOLICITUD_LABELS[solicitud.estado]}</Badge>
                      } else if (solicitud.estado === 'AUTORIZADA') {
                        badge = <Badge variant="info" className="bg-blue-50 text-blue-700 border-blue-200">{ESTADO_SOLICITUD_LABELS[solicitud.estado]}</Badge>
                      } else if (solicitud.estado === 'LISTO') {
                        badge = <Badge variant="success" className="bg-green-50 text-green-700 border-green-200">{ESTADO_SOLICITUD_LABELS[solicitud.estado]}</Badge>
                      } else if (solicitud.estado === 'RECHAZADA') {
                        badge = <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">{ESTADO_SOLICITUD_LABELS[solicitud.estado]}</Badge>
                      }

                      const esProcesando = procesandoId === solicitud.id

                      return (
                        <tr key={solicitud.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-neutral-800">
                              {solicitud.estudiante.usuario.nombres} {solicitud.estudiante.usuario.apellidos}
                            </div>
                            <div className="text-xs text-neutral-400">
                              Cód: {solicitud.estudiante.codigoEstudiante} · Especialidad: {solicitud.estudiante.especialidad.nombre}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-neutral-700 text-xs">
                            {TIPO_DOCUMENTO_LABELS[solicitud.tipo]}
                          </td>
                          <td className="px-4 py-3.5 text-neutral-600 text-xs">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                              {fecha}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-neutral-600 text-xs max-w-[200px] truncate" title={solicitud.motivo}>
                            {solicitud.motivo || <span className="text-neutral-400 italic">No especificado</span>}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {badge}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {solicitud.estado === 'PENDIENTE' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                                    disabled={esProcesando}
                                    onClick={() => handleProcesar(solicitud.id, 'AUTORIZADA')}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Autorizar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1"
                                    disabled={esProcesando}
                                    onClick={() => handleProcesar(solicitud.id, 'RECHAZADA')}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Rechazar
                                  </Button>
                                </>
                              )}

                              {solicitud.estado === 'AUTORIZADA' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                                    disabled={esProcesando}
                                    onClick={() => handleProcesar(solicitud.id, 'LISTO')}
                                  >
                                    <FileCheck className="w-3.5 h-3.5" />
                                    Emitir PDF
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1"
                                    disabled={esProcesando}
                                    onClick={() => handleProcesar(solicitud.id, 'RECHAZADA')}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Rechazar
                                  </Button>
                                </>
                              )}

                              {solicitud.estado === 'LISTO' && solicitud.documentoUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs text-neutral-700 border-neutral-300 hover:bg-neutral-100 gap-1"
                                  onClick={() => {
                                    window.open(`${SERVER_ORIGIN}${solicitud.documentoUrl}`, '_blank')
                                  }}
                                >
                                  Ver PDF
                                </Button>
                              )}

                              {solicitud.estado === 'RECHAZADA' && (
                                <span className="text-xs text-neutral-400 italic">Rechazado</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
