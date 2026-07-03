import type { Matricula } from './matricula'
import type { Usuario } from './usuario'

export interface Pago {
  id: number
  matricula: Matricula
  monto: number
  fechaPago: string
  metodoPago?: string
  numeroRecibo?: string
  registradoPor: Usuario
}
