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

  // Traemos todas las matriculas y filtramos en el cliente, asi al subir un voucher
  // la matricula (que pasa a PAGADA) no "desaparece" y el conteo por estado la muestra.
  const recargar = useCallback(async () => {
    setCargando(true)
    try {
      setSolicitudes(await matriculasApi.listar({}))
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setCargando(false)
    }
  }, [])

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
        (s) =>
          s.estado === filtroEstado &&
          (!filtroEspecialidad || s.estudiante.especialidad.nombre === filtroEspecialidad)
      ),
    [solicitudes, filtroEstado, filtroEspecialidad]
  )

  const conteos = useMemo(() => {
    const base: Record<EstadoMatricula, number> = {
      PENDIENTE: 0,
      PAGADA: 0,
      MATRICULADO: 0,
      RECHAZADA: 0,
    }
    for (const s of solicitudes) {
      if (s.estado in base) base[s.estado] += 1
    }
    return base
  }, [solicitudes])

  return {
    cargando,
    filtradas,
    especialidades,
    conteos,
    filtroEstado,
    setFiltroEstado,
    filtroEspecialidad,
    setFiltroEspecialidad,
    recargar,
  }
}
