import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { actasApi, periodosApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import type { ActaResumen, PeriodoAcademico } from '@/types'

export function useActasAdmin() {
  const [cargandoPeriodos, setCargandoPeriodos] = useState(true)
  const [cargandoActas, setCargandoActas] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [anio, setAnio] = useState<number | ''>('')
  const [semestre, setSemestre] = useState('')
  const [actas, setActas] = useState<ActaResumen[]>([])

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
      setCargandoActas(true)
      try {
        setActas(await actasApi.listar({ anio: anio as number, semestre }))
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargandoActas(false)
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

  function aplicarResumen(actualizada: ActaResumen) {
    setActas((prev) => prev.map((a) => (a.actaId === actualizada.actaId ? actualizada : a)))
  }

  async function validar(actaId: number) {
    setProcesando(true)
    try {
      aplicarResumen(await actasApi.validar(actaId))
      toast.success('Acta validada correctamente')
      return true
    } catch (err) {
      toast.error(getApiError(err))
      return false
    } finally {
      setProcesando(false)
    }
  }

  async function observar(actaId: number, observacion: string) {
    setProcesando(true)
    try {
      aplicarResumen(await actasApi.observar(actaId, observacion))
      toast.success('Acta observada, se notificó al docente')
      return true
    } catch (err) {
      toast.error(getApiError(err))
      return false
    } finally {
      setProcesando(false)
    }
  }

  return {
    cargandoPeriodos,
    cargandoActas,
    procesando,
    anio,
    semestre,
    actas,
    aniosDisponibles,
    semestresDisponibles,
    cambiarAnio,
    setSemestre,
    validar,
    observar,
  }
}
