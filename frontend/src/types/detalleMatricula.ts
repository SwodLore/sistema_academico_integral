import type { AsignacionDocente } from './asignacionDocente'
import type { Matricula } from './matricula'

export interface DetalleMatricula {
  id: number
  matricula: Matricula
  asignacion: AsignacionDocente
}
