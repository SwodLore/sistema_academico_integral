// Espejo de entity/Usuario.java y entity/Rol.java

export type Rol = 'ESTUDIANTE' | 'DOCENTE' | 'ADMINISTRADOR' | 'DIRECCION'

export interface Usuario {
  id: number
  nombres: string
  apellidos: string
  email: string
  codigoUsuario: string
  rol: Rol
  activo: boolean
}

export const ROL_LABELS: Record<Rol, string> = {
  ESTUDIANTE: 'Estudiante',
  DOCENTE: 'Docente',
  ADMINISTRADOR: 'Administrador',
  DIRECCION: 'Dirección',
}
