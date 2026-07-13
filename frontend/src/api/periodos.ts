import { api } from './axios'
import type { PeriodoAcademico } from '@/types'

export interface PeriodoPayload {
  anio: number
  semestre: string
  fechaInicio?: string
  fechaFin?: string
}

export const periodosApi = {
  listar: () => api.get<PeriodoAcademico[]>('/periodos').then((r) => r.data),

  crear: (datos: PeriodoPayload) =>
    api.post<PeriodoAcademico>('/periodos', datos).then((r) => r.data),

  editar: (id: number, datos: PeriodoPayload) =>
    api.put<PeriodoAcademico>(`/periodos/${id}`, datos).then((r) => r.data),

  activar: (id: number) =>
    api.patch<PeriodoAcademico>(`/periodos/${id}/activar`).then((r) => r.data),

  matricula: (id: number, abierta: boolean) =>
    api.patch<PeriodoAcademico>(`/periodos/${id}/matricula`, null, { params: { abierta } }).then((r) => r.data),
}
