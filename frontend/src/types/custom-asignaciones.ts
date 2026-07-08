import type { Curso } from './curso'
import type { Docente } from './docente'
import type { PeriodoAcademico } from './periodoAcademico'
import type { DiaSemana } from './horario'

export interface HorarioSimplificado {
  dia: DiaSemana
  horaInicio: string
  horaFin: string
  aula?: string
}

export interface AsignacionConHorarios {
  id: number
  curso: Curso
  docente: Docente
  periodo: PeriodoAcademico
  seccion: string
  horarios: HorarioSimplificado[]
}
