import type { Facultad } from './facultad'
import type { Usuario } from './usuario'

export interface Docente {
  id: number
  usuario: Usuario
  codigoDocente: string
  dni: string
  gradoAcademico?: string
  telefono?: string
  facultad?: Facultad
}
