import { api } from './axios'
import type { HojaNotas } from '@/types'

export const estudiantesApi = {
  hojaNotas: () =>
    api.get<HojaNotas>('/estudiantes/hoja-notas').then((r) => r.data),
}
