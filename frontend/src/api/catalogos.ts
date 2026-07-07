import { api } from './axios'
import type { Especialidad, Facultad } from '@/types'

export interface FacultadPayload {
  codigo: string
  nombre: string
}

export interface EspecialidadPayload {
  codigo: string
  nombre: string
  facultadId: number
}

export const catalogosApi = {
  facultades: () => api.get<Facultad[]>('/facultades').then((r) => r.data),
  especialidades: () => api.get<Especialidad[]>('/especialidades').then((r) => r.data),
  crearFacultad: (datos: FacultadPayload) => api.post<Facultad>('/facultades', datos).then((r) => r.data),
  crearEspecialidad: (datos: EspecialidadPayload) =>
    api.post<Especialidad>('/especialidades', datos).then((r) => r.data),
}
