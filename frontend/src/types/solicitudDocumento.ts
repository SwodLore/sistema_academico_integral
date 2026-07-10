import type { Estudiante } from './estudiante'
import type { Usuario } from './usuario'

export type TipoDocumento =
  | 'CERTIFICADO_ESTUDIOS'
  | 'CONSTANCIA_MATRICULA'
  | 'CONSTANCIA_NOTAS'
  | 'CONSTANCIA_EGRESADO'
  | 'CONSTANCIA_TERCIO_SUPERIOR'

export type EstadoSolicitud = 'PENDIENTE' | 'AUTORIZADA' | 'LISTO' | 'RECHAZADA'

export interface SolicitudDocumento {
  id: number
  estudiante: Estudiante
  tipo: TipoDocumento
  estado: EstadoSolicitud
  motivo?: string
  fechaSolicitud: string
  fechaAutorizacion?: string | null
  autorizadaPor?: Usuario | null
  fechaEmision?: string | null
  emitidaPor?: Usuario | null
  /** UUID del código QR de verificación */
  codigoVerificacion?: string | null
  documentoUrl?: string | null
}

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  CERTIFICADO_ESTUDIOS: 'Certificado de Estudios',
  CONSTANCIA_MATRICULA: 'Constancia de Matrícula',
  CONSTANCIA_NOTAS: 'Constancia de Notas',
  CONSTANCIA_EGRESADO: 'Constancia de Egresado',
  CONSTANCIA_TERCIO_SUPERIOR: 'Constancia de Tercio Superior',
}

export const ESTADO_SOLICITUD_LABELS: Record<EstadoSolicitud, string> = {
  PENDIENTE: 'Pendiente',
  AUTORIZADA: 'Autorizada',
  LISTO: 'Listo para Descargar',
  RECHAZADA: 'Rechazada',
}
