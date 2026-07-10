import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { catalogosApi, periodosApi, reportesApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import { descargarBlob } from '@/lib/descargarBlob'
import type { Especialidad, PeriodoAcademico, ReporteConsolidado } from '@/types'

export function useReporteConsolidado() {
  const [cargandoFiltros, setCargandoFiltros] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [especialidadId, setEspecialidadId] = useState<number | ''>('')
  const [anio, setAnio] = useState<number | ''>('')
  const [semestre, setSemestre] = useState('')
  const [reporte, setReporte] = useState<ReporteConsolidado | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const [esp, per] = await Promise.all([catalogosApi.especialidades(), periodosApi.listar()])
        setEspecialidades(esp)
        setPeriodos(per)
        if (esp.length > 0) setEspecialidadId(esp[0].id)
        const activo = per.find((p) => p.activo) ?? per[0]
        if (activo) {
          setAnio(activo.anio)
          setSemestre(activo.semestre)
        }
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargandoFiltros(false)
      }
    }
    cargar()
  }, [])

  const listo = especialidadId !== '' && anio !== '' && semestre !== ''

  useEffect(() => {
    if (!listo) return
    async function cargar() {
      setCargando(true)
      try {
        setReporte(
          await reportesApi.consolidado({
            especialidadId: especialidadId as number,
            anio: anio as number,
            semestre,
          })
        )
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [especialidadId, anio, semestre, listo])

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

  async function exportar(formato: 'pdf' | 'excel') {
    if (!listo) return
    setExportando(true)
    try {
      const params = { especialidadId: especialidadId as number, anio: anio as number, semestre }
      const blob = formato === 'pdf' ? await reportesApi.pdf(params) : await reportesApi.excel(params)
      const ext = formato === 'pdf' ? 'pdf' : 'csv'
      descargarBlob(blob, `reporte_${especialidadId}_${anio}-${semestre}.${ext}`)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setExportando(false)
    }
  }

  return {
    cargandoFiltros,
    cargando,
    exportando,
    especialidades,
    especialidadId,
    setEspecialidadId,
    anio,
    semestre,
    aniosDisponibles,
    semestresDisponibles,
    cambiarAnio,
    setSemestre,
    reporte,
    exportar,
  }
}
