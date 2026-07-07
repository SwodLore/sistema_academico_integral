// Respuesta del backend con la carga academica del docente

export interface HorarioClase {
  dia: string
  horaInicio: string
  horaFin: string
  aula?: string
}

export interface CursoAsignado {
  asignacionId: number
  cursoId: number
  codigo: string
  nombre: string
  seccion: string
  creditos: number
  horasSemanales: number
  horarios: HorarioClase[]
}

export interface DocenteCarga {
  totalCreditos: number
  totalHoras: number
  cursos: CursoAsignado[]
}
