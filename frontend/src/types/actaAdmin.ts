import type { EstadoActa } from './actaNota'
import type { EstadoNota } from './nota'

export interface ActaResumen {
  actaId: number
  asignacionId: number
  cursoCodigo: string
  cursoNombre: string
  seccion: string
  periodo: string
  docente: string
  especialidad: string
  estadoActa: EstadoActa
  totalEstudiantes: number
  aprobados: number
  desaprobados: number
  pendientes: number
  observacion: string | null
}

export interface ActaNotaEstudiante {
  detalleId: number
  notaId: number | null
  codigoEstudiante: string
  nombreCompleto: string
  parcial1: number | null
  parcial2: number | null
  practicas: number | null
  notaFinal: number | null
  promedio: number | null
  estado: EstadoNota
}

export interface ActaNotasDetalle {
  asignacionId: number
  cursoCodigo: string
  cursoNombre: string
  seccion: string
  periodo: string
  estadoActa: EstadoActa
  editable: boolean
  pesoParcial1: number
  pesoParcial2: number
  pesoPracticas: number
  pesoNotaFinal: number
  totalEstudiantes: number
  aprobados: number
  desaprobados: number
  pendientes: number
  estudiantes: ActaNotaEstudiante[]
}
