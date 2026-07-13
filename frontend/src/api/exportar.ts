import { api } from './axios'

type Formato = 'pdf' | 'csv'

function descargar(url: string, params: Record<string, unknown>) {
  return api.get<Blob>(url, { params, responseType: 'blob' }).then((r) => r.data)
}

export const exportarApi = {
  indicadores: (formato: Formato, params: { anio?: number; semestre?: string }) =>
    descargar('/exportar/indicadores', { formato, ...params }),

  matricula: (formato: Formato, params: { anio?: number; semestre?: string }) =>
    descargar('/exportar/matricula', { formato, ...params }),

  cumplimiento: (formato: Formato, params: { especialidadId: number; anio?: number; semestre?: string }) =>
    descargar('/exportar/cumplimiento', { formato, ...params }),
}
