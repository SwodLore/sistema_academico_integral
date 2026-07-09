import type { NotaCurso } from './hojaNotas'

export interface HistorialSemestre {
  periodo: string
  anio: number
  semestre: string
  matriculaEstado: string
  creditos: number
  promedioSemestre: number | null
  aprobados: number
  desaprobados: number
  pendientes: number
  cursos: NotaCurso[]
}

export interface Historial {
  estudianteCodigo: string
  estudianteNombre: string
  especialidad: string
  cicloActual: number
  creditosAprobados: number
  creditosCarrera: number
  promedioPonderadoAcumulado: number | null
  totalCursos: number
  cursosAprobados: number
  cursosDesaprobados: number
  semestres: HistorialSemestre[]
}
