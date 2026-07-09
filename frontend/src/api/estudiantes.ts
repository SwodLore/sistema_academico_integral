import { api } from './axios'
import type { HojaNotas, Historial } from '@/types'

export const estudiantesApi = {
  hojaNotas: () =>
    api.get<HojaNotas>('/estudiantes/hoja-notas').then((r) => r.data),

  historial: () =>
    api.get<Historial>('/estudiantes/historial').then((r) => r.data),
}
