import type { AsignacionDocente } from './asignacionDocente'

export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO'

export interface Horario {
  id: number
  asignacion: AsignacionDocente
  dia: DiaSemana
  horaInicio: string // "HH:mm:ss"
  horaFin: string
  aula?: string
}

export const DIA_SEMANA_LABELS: Record<DiaSemana, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
}
