import { api } from './axios'
import type { Rol } from '@/store/auth.store'

export interface Perfil {
  id: number
  nombres: string
  apellidos: string
  email: string
  codigoUsuario: string
  rol: Rol
}

export const perfilApi = {
  obtener: () => api.get<Perfil>('/perfil').then((r) => r.data),

  actualizar: (datos: { nombres: string; apellidos: string }) =>
    api.put<Perfil>('/perfil', datos).then((r) => r.data),

  cambiarPassword: (datos: { passwordActual: string; passwordNueva: string }) =>
    api.put<{ message: string }>('/perfil/password', datos).then((r) => r.data),
}
