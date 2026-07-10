import { api } from './axios'
import type { DocenteCarga, DocenteCargaResumen } from '@/types'

export const docentesApi = {
  cursosAsignados: (anio: number, semestre: string) =>
    api
      .get<DocenteCarga>('/docentes/cursos-asignados', { params: { anio, semestre } })
      .then((r) => r.data),

  cargaDocenteList: (params: { anio?: number | ''; semestre?: string; especialidadId?: number | '' }) =>
    api
      .get<DocenteCargaResumen[]>('/admin/carga-docente', { params })
      .then((r) => r.data),

  cargaDocenteDetalle: (
    docenteId: number,
    params: { anio?: number | ''; semestre?: string; especialidadId?: number | '' }
  ) =>
    api
      .get<DocenteCarga>(`/admin/carga-docente/${docenteId}`, { params })
      .then((r) => r.data),
}
