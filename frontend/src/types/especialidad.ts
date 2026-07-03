import type { Facultad } from './facultad'

export interface Especialidad {
  id: number
  codigo: string
  nombre: string
  facultad: Facultad
}
