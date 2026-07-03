import type { DetalleMatricula } from './detalleMatricula'

export type EstadoNota = 'PENDIENTE' | 'APROBADO' | 'DESAPROBADO'

export interface Nota {
  id: number
  detalle: DetalleMatricula
  parcial1?: number | null
  parcial2?: number | null
  notaFinal?: number | null
  promedio?: number | null
  estado: EstadoNota
  fechaActualizacion?: string | null
}

export const ESTADO_NOTA_LABELS: Record<EstadoNota, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  DESAPROBADO: 'Desaprobado',
}
