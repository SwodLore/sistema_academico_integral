import { api } from './axios'
import type { Curso, Docente, AsignacionConHorarios, HorarioSimplificado } from '@/types'

export interface CursoPayload {
  codigo: string
  nombre: string
  creditos: number
  horasSemanales: number
  ciclo: number
  especialidadId: number
  prerequisitoId?: number | null
}

export interface AsignacionPayload {
  cursoId: number
  docenteId: number
  anio: number
  semestre: string
  seccion: string
  horarios: HorarioSimplificado[]
}

export const cursosApi = {
  // Cursos CRUD
  listar: () => api.get<Curso[]>('/admin/cursos').then((r) => r.data),
  ver: (id: number) => api.get<Curso>(`/admin/cursos/${id}`).then((r) => r.data),
  crear: (datos: CursoPayload) => api.post<Curso>('/admin/cursos', datos).then((r) => r.data),
  editar: (id: number, datos: CursoPayload) => api.put<Curso>(`/admin/cursos/${id}`, datos).then((r) => r.data),
  eliminar: (id: number) => api.delete<{ message: string }>(`/admin/cursos/${id}`).then((r) => r.data),

  // Asignaciones & Horarios
  listarDocentes: () => api.get<Docente[]>('/admin/docentes').then((r) => r.data),
  listarAsignaciones: () => api.get<AsignacionConHorarios[]>('/admin/asignaciones').then((r) => r.data),
  crearAsignacion: (datos: AsignacionPayload) => api.post<{ message: string; id: number }>('/admin/asignaciones', datos).then((r) => r.data),
  editarAsignacion: (id: number, datos: AsignacionPayload) => api.put<{ message: string }>(`/admin/asignaciones/${id}`, datos).then((r) => r.data),
  eliminarAsignacion: (id: number) => api.delete<{ message: string }>(`/admin/asignaciones/${id}`).then((r) => r.data),
}
