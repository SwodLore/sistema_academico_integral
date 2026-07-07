import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { catalogosApi, usuariosApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import type { Especialidad, Facultad, Rol, UsuarioAdmin, UsuarioRequest } from '@/types'

export function useUsuarios() {
  const [cargando, setCargando] = useState(true)
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [filtroRol, setFiltroRol] = useState<Rol | ''>('')
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [facultades, setFacultades] = useState<Facultad[]>([])

  const recargar = useCallback(async () => {
    setCargando(true)
    try {
      setUsuarios(await usuariosApi.listar(filtroRol || undefined))
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCargando(false)
    }
  }, [filtroRol])

  useEffect(() => {
    recargar()
  }, [recargar])

  useEffect(() => {
    Promise.all([catalogosApi.especialidades(), catalogosApi.facultades()])
      .then(([esp, fac]) => {
        setEspecialidades(esp)
        setFacultades(fac)
      })
      .catch(() => {
        // los catalogos solo alimentan los selects del formulario
      })
  }, [])

  async function guardar(id: number | null, datos: UsuarioRequest): Promise<boolean> {
    try {
      if (id) {
        await usuariosApi.editar(id, datos)
        toast.success('Usuario actualizado')
      } else {
        await usuariosApi.crear(datos)
        toast.success(`Usuario creado. Entra con ${datos.email} y su DNI como contrasena`)
      }
      recargar()
      return true
    } catch (err) {
      toast.error(getApiError(err))
      return false
    }
  }

  async function cambiarEstado(usuario: UsuarioAdmin) {
    try {
      await usuariosApi.cambiarEstado(usuario.id, !usuario.activo)
      toast.success(usuario.activo ? 'Usuario desactivado' : 'Usuario activado')
      recargar()
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  return { cargando, usuarios, filtroRol, setFiltroRol, especialidades, facultades, guardar, cambiarEstado }
}
