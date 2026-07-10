import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { catalogosApi, cohortesApi, periodosApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import type { Cohorte, Especialidad, PeriodoAcademico } from '@/types'

export function useCohorte() {
  const [cargandoFiltros, setCargandoFiltros] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [especialidadId, setEspecialidadId] = useState<number | ''>('')
  const [anioIngreso, setAnioIngreso] = useState<number | ''>('')
  const [cohorte, setCohorte] = useState<Cohorte | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const [esp, per] = await Promise.all([catalogosApi.especialidades(), periodosApi.listar()])
        setEspecialidades(esp)
        setPeriodos(per)
        if (esp.length > 0) setEspecialidadId(esp[0].id)
        const anios = Array.from(new Set(per.map((p) => p.anio))).sort((a, b) => b - a)
        if (anios.length > 0) setAnioIngreso(anios[anios.length - 1]) // el mas antiguo disponible
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargandoFiltros(false)
      }
    }
    cargar()
  }, [])

  const listo = especialidadId !== '' && anioIngreso !== ''

  useEffect(() => {
    if (!listo) return
    async function cargar() {
      setCargando(true)
      try {
        setCohorte(
          await cohortesApi.analizar({
            anioIngreso: anioIngreso as number,
            especialidadId: especialidadId as number,
          })
        )
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [anioIngreso, especialidadId, listo])

  const aniosDisponibles = useMemo(
    () => Array.from(new Set(periodos.map((p) => p.anio))).sort((a, b) => a - b),
    [periodos]
  )

  return {
    cargandoFiltros,
    cargando,
    especialidades,
    especialidadId,
    setEspecialidadId,
    anioIngreso,
    setAnioIngreso,
    aniosDisponibles,
    cohorte,
  }
}
