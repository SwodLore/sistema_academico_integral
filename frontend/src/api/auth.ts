import { api } from './axios'
import type { User } from '@/store/auth.store'

export interface LoginResponse {
  token: string
  id: number
  nombres: string
  apellidos: string
  email: string
  rol: User['rol']
}

export const authApi = {
  login: (credenciales: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', credenciales).then((r) => r.data),
}
