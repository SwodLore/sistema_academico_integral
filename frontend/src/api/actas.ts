import { api } from './axios'
import type { ActaNotasDetalle, ActaResumen } from '@/types'

export interface FiltroActas {
  anio?: number
  semestre?: string
}

export const actasApi = {
  listar: (params: FiltroActas) =>
    api.get<ActaResumen[]>('/actas', { params }).then((r) => r.data),

  detalle: (actaId: number) =>
    api.get<ActaNotasDetalle>(`/actas/${actaId}`).then((r) => r.data),

  validar: (actaId: number) =>
    api.put<ActaResumen>(`/actas/${actaId}/validar`).then((r) => r.data),

  observar: (actaId: number, observacion: string) =>
    api.put<ActaResumen>(`/actas/${actaId}/observar`, { observacion }).then((r) => r.data),
}
