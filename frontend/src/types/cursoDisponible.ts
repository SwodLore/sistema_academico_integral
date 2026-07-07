// Respuesta del backend con la oferta de cursos (CursoDisponibleResponse)

export interface CursoDisponible {
  cursoId: number
  asignacionId?: number
  codigo: string
  nombre: string
  creditos: number
  docente: string
  seccion: string
  horarios: string[]
}

export interface CursosDisponibles {
  ciclo: number
  anio: number
  semestre: string
  maxCreditos: number
  cursos: CursoDisponible[]
}
