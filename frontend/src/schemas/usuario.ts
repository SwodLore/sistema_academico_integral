import type { Rol, UsuarioRequest } from '@/types'

export const ROLES: Rol[] = ['ESTUDIANTE', 'DOCENTE', 'ADMINISTRADOR', 'DIRECCION']

export const ROL_VARIANTS: Record<Rol, 'info' | 'success' | 'warning' | 'default'> = {
  ESTUDIANTE: 'info',
  DOCENTE: 'success',
  ADMINISTRADOR: 'warning',
  DIRECCION: 'default',
}

export const USUARIO_FORM_VACIO: UsuarioRequest = {
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  email: '',
  dni: '',
  rol: 'ESTUDIANTE',
  especialidadId: null,
  ciclo: 1,
  anioIngreso: new Date().getFullYear(),
  gradoAcademico: '',
  facultadId: null,
}

export function validarUsuario(form: UsuarioRequest): Record<string, string> {
  const errores: Record<string, string> = {}
  if (!form.nombres.trim()) errores.nombres = 'Los nombres son obligatorios'
  if (!form.apellidoPaterno.trim()) errores.apellidoPaterno = 'El apellido paterno es obligatorio'
  if (!form.apellidoMaterno.trim()) errores.apellidoMaterno = 'El apellido materno es obligatorio'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errores.email = 'Correo no valido'
  if (!/^\d{8}$/.test(form.dni)) errores.dni = 'El DNI debe tener 8 digitos'
  if (form.rol === 'ESTUDIANTE') {
    if (!form.especialidadId) errores.especialidadId = 'Selecciona la especialidad'
    if (!form.ciclo || form.ciclo < 1 || form.ciclo > 10) errores.ciclo = 'Ciclo entre 1 y 10'
    if (!form.anioIngreso) errores.anioIngreso = 'Indica el anio de ingreso'
  }
  if (form.rol === 'DOCENTE' && !form.facultadId) errores.facultadId = 'Selecciona la facultad'
  return errores
}

export function usuarioAForm(usuario: {
  nombres: string
  apellidos: string
  email: string
  dni?: string | null
  rol: Rol
  especialidadId?: number | null
  ciclo?: number | null
  anioIngreso?: number | null
  gradoAcademico?: string | null
  facultadId?: number | null
}): UsuarioRequest {
  const partes = usuario.apellidos.trim().split(' ')
  return {
    nombres: usuario.nombres,
    apellidoPaterno: partes[0] ?? '',
    apellidoMaterno: partes.slice(1).join(' '),
    email: usuario.email,
    dni: usuario.dni ?? '',
    rol: usuario.rol,
    especialidadId: usuario.especialidadId ?? null,
    ciclo: usuario.ciclo ?? 1,
    anioIngreso: usuario.anioIngreso ?? new Date().getFullYear(),
    gradoAcademico: usuario.gradoAcademico ?? '',
    facultadId: usuario.facultadId ?? null,
  }
}
