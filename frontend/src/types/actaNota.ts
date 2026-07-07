import type { AsignacionDocente } from './asignacionDocente'
import type { Usuario } from './usuario'

export type EstadoActa = 'ABIERTA' | 'OBSERVADA' | 'VALIDADA' | 'CERRADA'

export interface ActaNota {
  id: number
  asignacion: AsignacionDocente
  estado: EstadoActa
  fechaCierre?: string | null
  fechaValidacion?: string | null
  validadaPor?: Usuario | null
  observacion?: string | null
}

export const ESTADO_ACTA_LABELS: Record<EstadoActa, string> = {
  ABIERTA: 'Abierta',
  OBSERVADA: 'Observada',
  VALIDADA: 'Validada',
  CERRADA: 'Cerrada',
}
