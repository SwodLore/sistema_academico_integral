import type { Especialidad } from './especialidad'

export interface Curso {
  id: number
  codigo: string
  nombre: string
  creditos: number
  horasSemanales: number
  ciclo: number
  especialidad: Especialidad
  prerequisito?: Curso | null
}
