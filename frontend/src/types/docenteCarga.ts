

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
  especialidadNombre?: string
  ciclo?: number
}

export interface DocenteCarga {
  totalCreditos: number
  totalHoras: number
  cursos: CursoAsignado[]
}

export interface DocenteCargaResumen {
  docenteId: number
  codigoDocente: string
  dni: string
  nombreCompleto: string
  gradoAcademico: string
  facultadNombre: string
  cantidadCursos: number
  totalHoras: number
}
