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
  PENDIENTE: 'Pendiente de pago',
  VALIDADA: 'Validada',
  RECHAZADA: 'Rechazada',
  PAGADA: 'Pago por validar',
  MATRICULADO: 'Matriculado',
}

export type BadgeVariant = 'warning' | 'info' | 'destructive' | 'success'

export const ESTADO_MATRICULA_VARIANTS: Record<EstadoMatricula, BadgeVariant> = {
  PENDIENTE: 'warning',
  VALIDADA: 'info',
  RECHAZADA: 'destructive',
  PAGADA: 'info',
  MATRICULADO: 'success',
}

// Respuesta de /matriculas/estadisticas
export interface EstadisticasMatricula {
  periodo: string
  total: number
  porEstado: Record<EstadoMatricula, number>
  porEspecialidad: {
    especialidad: string
    solicitudes: number
    matriculados: number
    pendientes: number
    rechazadas: number
  }[]
}
