import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { estudiantesApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import type { HojaNotas } from '@/types'

export function useHojaNotas() {
  const [cargando, setCargando] = useState(true)
  const [hoja, setHoja] = useState<HojaNotas | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        setHoja(await estudiantesApi.hojaNotas())
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  return { cargando, hoja }
}
