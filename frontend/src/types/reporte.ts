export interface ReporteEstudiante {
  codigo: string
  nombre: string
  creditos: number
  cursos: number
  aprobados: number
  desaprobados: number
  pendientes: number
  promedio: number | null
  situacion: string
}

export interface ReporteConsolidado {
  especialidadId: number
  especialidad: string
  periodo: string
  anio: number
  semestre: string
  totalEstudiantes: number
  promedioGeneral: number | null
  aprobados: number
  desaprobados: number
  enCurso: number
  estudiantes: ReporteEstudiante[]
}
