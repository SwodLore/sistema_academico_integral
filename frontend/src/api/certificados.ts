import { api } from './axios'
import type { SolicitudDocumento, TipoDocumento, EstadoSolicitud } from '@/types'

export const certificadosApi = {
  misSolicitudes: () =>
    api.get<SolicitudDocumento[]>('/solicitudes-documento/mis-solicitudes').then((r) => r.data),

  crearSolicitud: (datos: { tipo: TipoDocumento; motivo?: string }) =>
    api.post<SolicitudDocumento>('/solicitudes-documento', datos).then((r) => r.data),

  listarTodas: () =>
    api.get<SolicitudDocumento[]>('/solicitudes-documento').then((r) => r.data),

  procesarSolicitud: (id: number, datos: { estado: EstadoSolicitud }) =>
    api.put<SolicitudDocumento>(`/solicitudes-documento/${id}/procesar`, datos).then((r) => r.data),
}
