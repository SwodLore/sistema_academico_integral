import { api } from './axios'
import type { Rol, UsuarioAdmin, UsuarioRequest } from '@/types'

export const usuariosApi = {
  listar: (rol?: Rol) =>
    api.get<UsuarioAdmin[]>('/admin/usuarios', { params: rol ? { rol } : {} }).then((r) => r.data),

  crear: (datos: UsuarioRequest) =>
    api.post<UsuarioAdmin>('/admin/usuarios', datos).then((r) => r.data),

  editar: (id: number, datos: UsuarioRequest) =>
    api.put<UsuarioAdmin>(`/admin/usuarios/${id}`, datos).then((r) => r.data),

  cambiarEstado: (id: number, activo: boolean) =>
    api.patch<UsuarioAdmin>(`/admin/usuarios/${id}/estado`, null, { params: { activo } }).then((r) => r.data),
}
