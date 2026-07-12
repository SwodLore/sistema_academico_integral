import { api } from './axios'
import type {
  CursoDisponible,
  CursosDisponibles,
  EstadisticasMatricula,
  EstadoMatricula,
  Matricula,
  Pago,
} from '@/types'

export interface SolicitudMatriculaPayload {
  ciclo: number
  anio: number
  semestre: string
  cursosIds: number[]
}

export interface FiltroMatriculas {
  estado?: EstadoMatricula
  anio?: number
  semestre?: string
  especialidadId?: number
}

export interface MiMatricula {
  matricula?: Matricula
  cursos?: CursoDisponible[]
}

export const matriculasApi = {
  listar: (params: FiltroMatriculas) =>
    api.get<Matricula[]>('/matriculas', { params }).then((r) => r.data),

  miMatricula: () =>
    api.get<MiMatricula>('/matriculas/mi-matricula').then((r) => r.data),

  cursosDisponibles: () =>
    api.get<CursosDisponibles>('/matriculas/cursos-disponibles').then((r) => r.data),

  solicitar: (payload: SolicitudMatriculaPayload) =>
    api.post<Matricula>('/matriculas/solicitar', payload).then((r) => r.data),

  cursos: (id: number) =>
    api.get<CursoDisponible[]>(`/matriculas/${id}/cursos`).then((r) => r.data),

  pago: (id: number) =>
    api.get<Pago | null>(`/matriculas/${id}/pago`).then((r) => r.data),

  registrarPago: (id: number, datos: FormData) =>
    api.post<Pago>(`/matriculas/${id}/pago`, datos).then((r) => r.data),

  subirVoucher: (id: number, datos: FormData) =>
    api.post<Pago>(`/matriculas/${id}/voucher`, datos).then((r) => r.data),

  estadisticas: (params?: { anio?: number; semestre?: string }) =>
    api.get<EstadisticasMatricula>('/matriculas/estadisticas', { params }).then((r) => r.data),

  validar: (id: number, aprobado: boolean, observacion: string | null) =>
    api.put<Matricula>(`/matriculas/${id}/validar`, { aprobado, observacion }).then((r) => r.data),

  ficha: (id: number) =>
    api.get<Blob>(`/matriculas/${id}/ficha`, { responseType: 'blob' }).then((r) => r.data),

  fichaOficial: (id: number) =>
    api.get<Blob>(`/matriculas/${id}/ficha-oficial`, { responseType: 'blob' }).then((r) => r.data),
}
