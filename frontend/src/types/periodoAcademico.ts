export interface PeriodoAcademico {
  id: number
  codigo: string
  anio: number
  semestre: 'I' | 'II'
  fechaInicio?: string
  fechaFin?: string
  activo: boolean
  matriculaAbierta: boolean
}
