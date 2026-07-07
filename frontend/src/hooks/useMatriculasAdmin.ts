import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { matriculasApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import type { EstadoMatricula, Matricula } from '@/types'

export function useMatriculasAdmin() {
  const [cargando, setCargando] = useState(true)
  const [solicitudes, setSolicitudes] = useState<Matricula[]>([])
  const [filtroEstado, setFiltroEstado] = useState<EstadoMatricula>('PENDIENTE')
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('')

  const recargar = useCallback(async () => {
    setCargando(true)
    try {
      setSolicitudes(await matriculasApi.listar({ estado: filtroEstado }))
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCargando(false)
    }
  }, [filtroEstado])

  useEffect(() => {
    recargar()
  }, [recargar])

  const especialidades = useMemo(
    () => [...new Set(solicitudes.map((s) => s.estudiante.especialidad.nombre))],
    [solicitudes]
  )

  const filtradas = useMemo(
    () =>
      solicitudes.filter(
        (s) => !filtroEspecialidad || s.estudiante.especialidad.nombre === filtroEspecialidad
      ),
    [solicitudes, filtroEspecialidad]
  )

  return {
    cargando,
    filtradas,
    especialidades,
    filtroEstado,
    setFiltroEstado,
    filtroEspecialidad,
    setFiltroEspecialidad,
    recargar,
  }
}
