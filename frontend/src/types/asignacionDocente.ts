import type { Curso } from './curso'
import type { Docente } from './docente'
import type { PeriodoAcademico } from './periodoAcademico'

export interface AsignacionDocente {
  id: number
  curso: Curso
  docente: Docente
  periodo: PeriodoAcademico
  seccion: string
  silaboUrl?: string | null
  silaboNombre?: string | null
  fechaCargaSilabo?: string | null
}
