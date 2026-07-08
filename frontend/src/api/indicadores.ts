import { api } from './axios'
import type { Indicadores } from '@/types'

export interface FiltroIndicadores {
  anio?: number
  semestre?: string
}

export const indicadoresApi = {
  obtener: (params: FiltroIndicadores) =>
    api.get<Indicadores>('/indicadores', { params }).then((r) => r.data),
}
