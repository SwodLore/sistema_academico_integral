import { api } from './axios'
import type { LogAuditoria, PageResponse } from '@/types'

export interface FiltroAuditoria {
  usuarioId?: number
  modulo?: string
  desde?: string
  hasta?: string
  page?: number
  size?: number
}

export const auditoriaApi = {
  listar: (params: FiltroAuditoria) =>
    api.get<PageResponse<LogAuditoria>>('/admin/auditoria', { params }).then((r) => r.data),
}
