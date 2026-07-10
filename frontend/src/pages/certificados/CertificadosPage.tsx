import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { certificadosApi, SERVER_ORIGIN } from '@/api'
import { getApiError } from '@/lib/apiError'
import { toast } from 'sonner'
import type { SolicitudDocumento, TipoDocumento } from '@/types'
import { TIPO_DOCUMENTO_LABELS, ESTADO_SOLICITUD_LABELS } from '@/types/solicitudDocumento'
import { 
  FileText, 
  Plus, 
  Download, 
  Calendar
} from 'lucide-react'

export default function CertificadosPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudDocumento[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  
  // Form State
  const [tipo, setTipo] = useState<TipoDocumento>('CERTIFICADO_ESTUDIOS')
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Load student requests
  const cargarSolicitudes = async () => {
    try {
      const data = await certificadosApi.misSolicitudes()
      setSolicitudes(data)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarSolicitudes()
  }, [])

  // Submit request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    try {
      await certificadosApi.crearSolicitud({ tipo, motivo: motivo.trim() || undefined })
      toast.success('Solicitud registrada correctamente')
      setMotivo('')
      setModalAbierto(false)
      cargarSolicitudes()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setEnviando(false)
    }
  }

  // Statistics
  const stats = useMemo(() => {
    const total = solicitudes.length
    const pendientes = solicitudes.filter((s) => s.estado === 'PENDIENTE').length
    const emitidas = solicitudes.filter((s) => s.estado === 'EMITIDA').length
    const rechazadas = solicitudes.filter((s) => s.estado === 'RECHAZADA').length
    return { total, pendientes, emitidas, rechazadas }
  }, [solicitudes])

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <FileText className="w-7 h-7 text-neutral-500" />
              Certificados y Constancias
            </h1>
            <p className="text-sm text-neutral-500">
              Solicita documentos oficiales en línea y descárgalos una vez emitidos.
            </p>
          </div>

          <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" />
                Nueva Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="pb-2 border-b border-neutral-100">
                  <DialogTitle className="text-lg font-bold">Solicitar Documento</DialogTitle>
                  <DialogDescription>
                    Selecciona el tipo de certificado o constancia académica que deseas tramitar.
                  </DialogDescription>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tipo" className="text-xs font-semibold text-neutral-600">Tipo de Documento</Label>
                  <select
                    id="tipo"
                    className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoDocumento)}
                  >
                    {Object.entries(TIPO_DOCUMENTO_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="motivo" className="text-xs font-semibold text-neutral-600">Motivo (Opcional)</Label>
                  <textarea
                    id="motivo"
                    placeholder="Ej. Trámite de beca, postulación laboral, etc."
                    className="min-h-[90px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    maxLength={300}
                  />
                </div>

                <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={enviando}>
                    {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Total Trámites</CardDescription>
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
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-green-600">Listos / Emitidos</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="text-2xl font-extrabold text-green-600">{stats.emitidas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-red-600">Rechazados</CardDescription>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className="text-2xl font-extrabold text-red-600">{stats.rechazadas}</div>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Historial de Solicitudes</CardTitle>
            <CardDescription>
              Seguimiento de tus solicitudes anteriores de documentos. Puedes descargar tus archivos en formato PDF una vez que estén marcados como Emitidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {cargando ? (
              <div className="text-center py-16">
                <p className="text-sm text-neutral-500">Cargando historial de solicitudes...</p>
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">Aún no has registrado solicitudes de certificados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-left">
                      <th className="px-4 py-3.5 font-semibold text-neutral-600">Documento</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600">Fecha Solicitud</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600">Motivo</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600 text-center">Estado</th>
                      <th className="px-4 py-3.5 font-semibold text-neutral-600 text-right">Descargar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((solicitud) => {
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
                      } else if (solicitud.estado === 'EMITIDA') {
                        badge = <Badge variant="success" className="bg-green-50 text-green-700 border-green-200">{ESTADO_SOLICITUD_LABELS[solicitud.estado]}</Badge>
                      } else if (solicitud.estado === 'RECHAZADA') {
                        badge = <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">{ESTADO_SOLICITUD_LABELS[solicitud.estado]}</Badge>
                      }

                      const canDownload = solicitud.estado === 'EMITIDA' && solicitud.documentoUrl

                      return (
                        <tr key={solicitud.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                          <td className="px-4 py-3.5 font-medium text-neutral-800">
                            {TIPO_DOCUMENTO_LABELS[solicitud.tipo]}
                          </td>
                          <td className="px-4 py-3.5 text-neutral-600 text-xs">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                              {fecha}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-neutral-600 text-xs max-w-[240px] truncate" title={solicitud.motivo}>
                            {solicitud.motivo || <span className="text-neutral-400 italic">No especificado</span>}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {badge}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {canDownload ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800 gap-1"
                                onClick={() => {
                                  window.open(`${SERVER_ORIGIN}${solicitud.documentoUrl}`, '_blank')
                                }}
                              >
                                <Download className="w-3.5 h-3.5" />
                                Descargar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled
                                className="h-8 text-neutral-300 gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Descargar
                              </Button>
                            )}
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
