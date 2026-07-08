export interface IndicadorEspecialidad {
  especialidadId: number
  especialidad: string
  estudiantes: number
  cursosCalificados: number
  promedio: number | null
  aprobados: number
  desaprobados: number
  pendientes: number
  tasaAprobacion: number
  tasaDesaprobacion: number
}

export interface Indicadores {
  periodo: string
  anio: number
  semestre: string
  totalEstudiantes: number
  totalCalificados: number
  promedioGeneral: number | null
  aprobados: number
  desaprobados: number
  pendientes: number
  tasaAprobacion: number
  tasaDesaprobacion: number
  especialidades: IndicadorEspecialidad[]
}
