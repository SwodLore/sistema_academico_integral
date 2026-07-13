import { useState } from 'react'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { descargarBlob } from '@/lib/descargarBlob'
import { getApiError } from '@/lib/apiError'

interface Props {
  /** Descarga el reporte en el formato dado y devuelve el blob */
  exportar: (formato: 'pdf' | 'csv') => Promise<Blob>
  /** Nombre base del archivo, sin extensión */
  nombre: string
  disabled?: boolean
}

export default function BotonesExportar({ exportar, nombre, disabled }: Props) {
  const [cargando, setCargando] = useState<'pdf' | 'csv' | null>(null)

  async function descargar(formato: 'pdf' | 'csv') {
    setCargando(formato)
    try {
      const blob = await exportar(formato)
      descargarBlob(blob, `${nombre}.${formato}`)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCargando(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={disabled || cargando !== null}
        onClick={() => descargar('pdf')}
      >
        <Download className="size-4" />
        {cargando === 'pdf' ? 'Generando...' : 'PDF'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={disabled || cargando !== null}
        onClick={() => descargar('csv')}
      >
        <Download className="size-4" />
        {cargando === 'csv' ? 'Generando...' : 'Excel'}
      </Button>
    </div>
  )
}
