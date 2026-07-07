import type { EstadoNota } from './nota'
import type { EstadoActa } from './actaNota'

export interface NotaCurso {
  asignacionId: number
  cursoCodigo: string
  cursoNombre: string
  creditos: number
  seccion: string
  docente: string
  parcial1: number | null
  parcial2: number | null
  practicas: number | null
  notaFinal: number | null
  promedio: number | null
  estado: EstadoNota
  estadoActa: EstadoActa
}

export interface HojaNotas {
  tieneMatricula: boolean
  matriculaEstado: string | null
  periodo: string
  ciclo: number
  pesoParcial1: number
  pesoParcial2: number
  pesoPracticas: number
  pesoNotaFinal: number
  promedioPonderado: number | null
  totalCursos: number
  aprobados: number
  desaprobados: number
  pendientes: number
  totalCreditos: number
  creditosAprobados: number
  cursos: NotaCurso[]
}
