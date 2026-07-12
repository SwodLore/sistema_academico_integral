import type { Rol } from '@/store/auth.store'

// Pantalla inicial de cada rol
export function rutaPorRol(rol: Rol): string {
  if (rol === 'DIRECCION') return '/direccion'
  if (rol === 'ADMINISTRADOR') return '/admin'
  if (rol === 'DOCENTE') return '/cursos'
  return '/matricula'
}
