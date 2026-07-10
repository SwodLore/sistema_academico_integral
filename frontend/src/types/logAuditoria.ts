// Espejo de dto/LogAuditoriaResponse.java

export interface LogAuditoria {
  id: number
  usuarioId: number
  usuarioNombre: string
  usuarioEmail: string
  modulo: string
  accion: string
  detalle?: string
  resultado: 'EXITO' | 'ERROR'
  ip?: string
  fecha: string
}

// Espejo de la respuesta paginada de Spring (Page<T>)
export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  first: boolean
  last: boolean
}
