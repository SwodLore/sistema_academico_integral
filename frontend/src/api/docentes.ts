import { api } from './axios'
import type { DocenteCarga } from '@/types'

export const docentesApi = {
  cursosAsignados: (anio: number, semestre: string) =>
    api
      .get<DocenteCarga>('/docentes/cursos-asignados', { params: { anio, semestre } })
      .then((r) => r.data),
}
