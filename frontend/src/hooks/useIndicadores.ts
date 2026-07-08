import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { indicadoresApi, periodosApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import type { Indicadores, PeriodoAcademico } from '@/types'

export function useIndicadores() {
  const [cargandoPeriodos, setCargandoPeriodos] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [anio, setAnio] = useState<number | ''>('')
  const [semestre, setSemestre] = useState('')
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await periodosApi.listar()
        setPeriodos(data)
        const activo = data.find((p) => p.activo) ?? data[0]
        if (activo) {
          setAnio(activo.anio)
          setSemestre(activo.semestre)
        }
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargandoPeriodos(false)
      }
    }
    cargar()
  }, [])

  useEffect(() => {
    if (anio === '' || !semestre) return
    async function cargar() {
      setCargando(true)
      try {
        setIndicadores(await indicadoresApi.obtener({ anio: anio as number, semestre }))
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [anio, semestre])

  const aniosDisponibles = useMemo(
    () => Array.from(new Set(periodos.map((p) => p.anio))).sort((a, b) => b - a),
    [periodos]
  )

  const semestresDisponibles = useMemo(
    () =>
      periodos
        .filter((p) => p.anio === anio)
        .map((p) => p.semestre)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort(),
    [periodos, anio]
  )

  function cambiarAnio(valor: number | '') {
    setAnio(valor)
    const sems = periodos.filter((p) => p.anio === valor).map((p) => p.semestre)
    if (sems.length > 0 && !sems.some((s) => s === semestre)) setSemestre(sems[0])
  }

  return {
    cargandoPeriodos,
    cargando,
    anio,
    semestre,
    indicadores,
    aniosDisponibles,
    semestresDisponibles,
    cambiarAnio,
    setSemestre,
  }
}
