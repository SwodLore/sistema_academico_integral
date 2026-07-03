import type { Estudiante } from './estudiante'
import type { PeriodoAcademico } from './periodoAcademico'
import type { Usuario } from './usuario'

export type EstadoMatricula =
  | 'PENDIENTE'
  | 'VALIDADA'
  | 'RECHAZADA'
  | 'PAGADA'
  | 'MATRICULADO'

export interface Matricula {
  id: number
  estudiante: Estudiante
  periodo: PeriodoAcademico
  estado: EstadoMatricula
  fechaSolicitud: string
  fechaValidacion?: string | null
  validadaPor?: Usuario | null
  observacion?: string | null
  numeroFicha?: string | null
}

export const ESTADO_MATRICULA_LABELS: Record<EstadoMatricula, string> = {
  PENDIENTE: 'Pendiente',
  VALIDADA: 'Validada',
  RECHAZADA: 'Rechazada',
  PAGADA: 'Pagada',
  MATRICULADO: 'Matriculado',
}
