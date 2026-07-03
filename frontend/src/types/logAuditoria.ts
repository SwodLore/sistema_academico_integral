import type { Usuario } from './usuario'

export interface LogAuditoria {
  id: number
  usuario: Usuario
  modulo: string
  accion: string
  detalle?: string
  ip?: string
  fecha: string
}
