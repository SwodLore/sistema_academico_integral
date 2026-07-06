// Tipos para la gestion de usuarios del admin (HU-25)

import type { Rol } from './usuario'

export interface UsuarioRequest {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  dni: string
  rol: Rol
  especialidadId?: number | null
  ciclo?: number | null
  anioIngreso?: number | null
  gradoAcademico?: string | null
  facultadId?: number | null
}

export interface UsuarioAdmin {
  id: number
  nombres: string
  apellidos: string
  email: string
  codigoUsuario: string
  rol: Rol
  activo: boolean
  dni?: string | null
  especialidad?: string | null
  especialidadId?: number | null
  ciclo?: number | null
  anioIngreso?: number | null
  gradoAcademico?: string | null
  facultad?: string | null
  facultadId?: number | null
}
