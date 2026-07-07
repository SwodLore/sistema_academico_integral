import { api } from './axios'
import type { PeriodoAcademico } from '@/types'

export const periodosApi = {
  listar: () => api.get<PeriodoAcademico[]>('/periodos').then((r) => r.data),
}
