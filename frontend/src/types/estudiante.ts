import type { Especialidad } from './especialidad'
import type { Usuario } from './usuario'

export interface Estudiante {
  id: number
  usuario: Usuario
  codigoEstudiante: string
  dni: string
  especialidad: Especialidad
  cicloActual: number
  /** Año de ingreso: define la cohorte */
  anioIngreso: number
  telefono?: string
  direccion?: string
  fechaNacimiento?: string // ISO date "YYYY-MM-DD"
}
