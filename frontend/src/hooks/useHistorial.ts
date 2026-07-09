import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { estudiantesApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import type { Historial } from '@/types'

export function useHistorial() {
  const [cargando, setCargando] = useState(true)
  const [historial, setHistorial] = useState<Historial | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        setHistorial(await estudiantesApi.historial())
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  return { cargando, historial }
}
