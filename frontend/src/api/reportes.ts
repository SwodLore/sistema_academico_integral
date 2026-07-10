import { api } from './axios'
import type { ReporteConsolidado } from '@/types'

export interface FiltroReporte {
  especialidadId: number
  anio: number
  semestre: string
}

export const reportesApi = {
  consolidado: (params: FiltroReporte) =>
    api.get<ReporteConsolidado>('/reportes/consolidado', { params }).then((r) => r.data),

  pdf: (params: FiltroReporte) =>
    api.get<Blob>('/reportes/consolidado/pdf', { params, responseType: 'blob' }).then((r) => r.data),

  excel: (params: FiltroReporte) =>
    api.get<Blob>('/reportes/consolidado/excel', { params, responseType: 'blob' }).then((r) => r.data),
}
