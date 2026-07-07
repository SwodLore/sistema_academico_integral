import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import { Button } from '@/components/ui/button'
import { BookOpen, FileText, Library, Calendar, X, RefreshCw, File } from 'lucide-react'

interface SilaboModalProps {
  isOpen: boolean
  onClose: () => void
  asignacionId: number
  mode: 'edit' | 'read'
}

interface SilaboResponse {
  asignacionId: number
  cursoCodigo: string
  cursoNombre: string
  seccion: string
  docenteNombre: string
  competencias?: string
  contenido?: string
  bibliografia?: string
  fechaActualizacion?: string
  silaboNombre?: string
  silaboUrl?: string
}

export default function SilaboModal({ isOpen, onClose, asignacionId, mode }: SilaboModalProps) {
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [data, setData] = useState<SilaboResponse | null>(null)

  const [competencias, setCompetencias] = useState('')
  const [contenido, setContenido] = useState('')
  const [bibliografia, setBibliografia] = useState('')

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [subiendoPdf, setSubiendoPdf] = useState(false)

  async function handleDescargarPdf() {
    if (!data?.silaboUrl) return
    try {
      const relativePath = data.silaboUrl.replace(/^\/api/, '')
      const res = await api.get(relativePath, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', data.silaboNombre || 'silabo.pdf')
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Error al descargar el archivo PDF')
    }
  }

  async function handleUploadPdf() {
    if (!pdfFile) return
    const formData = new FormData()
    formData.append('file', pdfFile)

    setSubiendoPdf(true)
    try {
      const res = await api.post(`/silabos/${asignacionId}/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setData(prev => prev ? {
        ...prev,
        silaboNombre: res.data.silaboNombre,
        silaboUrl: res.data.silaboUrl,
        fechaActualizacion: res.data.fechaActualizacion
      } : null)
      setPdfFile(null)
      toast.success('Archivo PDF subido exitosamente')
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message ?? 'Error al subir el archivo PDF')
    } finally {
      setSubiendoPdf(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    async function cargarSilabo() {
      setCargando(true)
      try {
        const res = await api.get<SilaboResponse>(`/silabos/${asignacionId}`)
        setData(res.data)
        setCompetencias(res.data.competencias ?? '')
        setContenido(res.data.contenido ?? '')
        setBibliografia(res.data.bibliografia ?? '')
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error.response?.data?.message ?? 'Error al cargar el sílabo')
      } finally {
        setCargando(false)
      }
    }

    cargarSilabo()
  }, [isOpen, asignacionId])

  async function handleSave() {
    if (!competencias.trim() || !contenido.trim() || !bibliografia.trim()) {
      toast.error('Todos los campos son obligatorios')
      return
    }

    setGuardando(true)
    try {
      const res = await api.put<SilaboResponse>(`/silabos/${asignacionId}`, {
        competencias,
        contenido,
        bibliografia,
      })
      setData(res.data)
      toast.success('Sílabo guardado exitosamente')
      onClose()
    } catch (err) {
      const error = err as { response?: { data?: { message?: string; competencias?: string; contenido?: string; bibliografia?: string } } }
      const resData = error.response?.data
      if (resData?.competencias) toast.error(resData.competencias)
      else if (resData?.contenido) toast.error(resData.contenido)
      else if (resData?.bibliografia) toast.error(resData.bibliografia)
      else toast.error(resData?.message ?? 'Error al guardar el sílabo')
    } finally {
      setGuardando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-neutral-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900">
              Sílabo del Curso
            </h2>
            {data && (
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                {data.cursoCodigo} - {data.cursoNombre} (Sec. {data.seccion}) · Docente: {data.docenteNombre}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-full hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cargando ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
              <p className="text-neutral-500 text-sm">Cargando sílabo...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Fecha de Actualización */}
              {data?.fechaActualizacion && (
                <div className="flex items-center gap-2 bg-neutral-100/70 border border-neutral-200 text-neutral-600 px-3 py-2 rounded-lg text-xs font-semibold w-fit">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span>
                    Última actualización:{' '}
                    {new Date(data.fechaActualizacion).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}

              {/* Competencias */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-neutral-800 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-neutral-500" />
                  Competencias
                </label>
                {mode === 'edit' ? (
                  <textarea
                    value={competencias}
                    onChange={(e) => setCompetencias(e.target.value)}
                    placeholder="Describa las competencias que los estudiantes adquirirán en este curso..."
                    rows={4}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-3 text-sm text-neutral-900 focus:ring-neutral-500 focus:border-neutral-500 placeholder-neutral-400 focus:outline-none transition-shadow focus:shadow-xs"
                  />
                ) : (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
                    {competencias || <span className="text-neutral-400 italic">No registradas.</span>}
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-neutral-800 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-neutral-500" />
                  Contenido del Curso
                </label>
                {mode === 'edit' ? (
                  <textarea
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder="Describa el temario, unidades de aprendizaje o contenidos temáticos del curso..."
                    rows={6}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-3 text-sm text-neutral-900 focus:ring-neutral-500 focus:border-neutral-500 placeholder-neutral-400 focus:outline-none transition-shadow focus:shadow-xs"
                  />
                ) : (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
                    {contenido || <span className="text-neutral-400 italic">No registrado.</span>}
                  </div>
                )}
              </div>

              {/* Bibliografía */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-neutral-800 uppercase tracking-wider">
                  <Library className="w-4 h-4 text-neutral-500" />
                  Bibliografía
                </label>
                {mode === 'edit' ? (
                  <textarea
                    value={bibliografia}
                    onChange={(e) => setBibliografia(e.target.value)}
                    placeholder="Escriba las referencias bibliográficas y lecturas recomendadas..."
                    rows={3}
                    className="w-full bg-white border border-neutral-300 rounded-lg p-3 text-sm text-neutral-900 focus:ring-neutral-500 focus:border-neutral-500 placeholder-neutral-400 focus:outline-none transition-shadow focus:shadow-xs"
                  />
                ) : (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
                    {bibliografia || <span className="text-neutral-400 italic">No registrada.</span>}
                  </div>
                )}
              </div>

              {/* Documento PDF del Sílabo */}
              <div className="space-y-2 border-t pt-4 border-neutral-100">
                <label className="flex items-center gap-2 text-sm font-bold text-neutral-800 uppercase tracking-wider">
                  <File className="w-4 h-4 text-neutral-500" />
                  Archivo PDF del Sílabo
                </label>
                {data?.silaboNombre && (
                  <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-neutral-600">
                      Archivo cargado: {data.silaboNombre}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDescargarPdf}
                      className="text-xs gap-1.5"
                    >
                      Descargar PDF
                    </Button>
                  </div>
                )}

                {mode === 'edit' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-xs text-neutral-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
                    />
                    {pdfFile && (
                      <Button
                        size="sm"
                        onClick={handleUploadPdf}
                        disabled={subiendoPdf}
                        className="whitespace-nowrap"
                      >
                        {subiendoPdf ? 'Subiendo...' : 'Subir PDF'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!cargando && (
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={guardando}>
              {mode === 'edit' ? 'Cancelar' : 'Cerrar'}
            </Button>
            {mode === 'edit' && (
              <Button onClick={handleSave} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar Sílabo'}
              </Button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
