import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { catalogosApi, type EspecialidadPayload, type FacultadPayload } from '@/api'
import { getApiError } from '@/lib/apiError'
import type { Especialidad, Facultad } from '@/types'

export function useCatalogos() {
  const [facultades, setFacultades] = useState<Facultad[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])

  const cargar = useCallback(async () => {
    try {
      const [fac, esp] = await Promise.all([catalogosApi.facultades(), catalogosApi.especialidades()])
      setFacultades(fac)
      setEspecialidades(esp)
    } catch (err) {
      toast.error(getApiError(err))
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function crearFacultad(datos: FacultadPayload): Promise<boolean> {
    try {
      await catalogosApi.crearFacultad(datos)
      toast.success('Facultad creada')
      cargar()
      return true
    } catch (err) {
      toast.error(getApiError(err))
      return false
    }
  }

  async function crearEspecialidad(datos: EspecialidadPayload): Promise<boolean> {
    try {
      await catalogosApi.crearEspecialidad(datos)
      toast.success('Especialidad creada')
      cargar()
      return true
    } catch (err) {
      toast.error(getApiError(err))
      return false
    }
  }

  return { facultades, especialidades, crearFacultad, crearEspecialidad }
}
