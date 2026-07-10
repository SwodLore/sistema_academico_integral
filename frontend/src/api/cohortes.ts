import { api } from './axios'
import type { Cohorte } from '@/types'

export interface FiltroCohorte {
  anioIngreso: number
  especialidadId: number
}

export const cohortesApi = {
  analizar: (params: FiltroCohorte) =>
    api.get<Cohorte>('/cohortes', { params }).then((r) => r.data),
}
