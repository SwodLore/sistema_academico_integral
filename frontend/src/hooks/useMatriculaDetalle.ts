import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { matriculasApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import { descargarBlob } from '@/lib/descargarBlob'
import type { CursoDisponible, Matricula, Pago } from '@/types'

// Maneja el detalle de una matricula y las acciones del admin sobre ella.
// onCambio se dispara cuando cambia el estado, para refrescar el listado.
export function useMatriculaDetalle(onCambio: () => void) {
  const [detalle, setDetalle] = useState<Matricula | null>(null)
  const [cursos, setCursos] = useState<CursoDisponible[]>([])
  const [pago, setPago] = useState<Pago | null>(null)
  const [cargando, setCargando] = useState(false)
  const [procesando, setProcesando] = useState(false)

  const abrir = useCallback(async (matricula: Matricula) => {
    setDetalle(matricula)
    setPago(null)
    setCargando(true)
    try {
      setCursos(await matriculasApi.cursos(matricula.id))
      if (matricula.estado === 'PAGADA' || matricula.estado === 'MATRICULADO') {
        setPago(await matriculasApi.pago(matricula.id))
      }
    } catch (err) {
      toast.error(getApiError(err))
      setDetalle(null)
    } finally {
      setCargando(false)
    }
  }, [])

  const cerrar = useCallback(() => setDetalle(null), [])

  const validar = useCallback(
    async (aprobado: boolean, observacion: string | null) => {
      if (!detalle) return
      setProcesando(true)
      try {
        await matriculasApi.validar(detalle.id, aprobado, observacion)
        toast.success(aprobado ? 'Matricula aprobada' : 'Matricula rechazada')
        cerrar()
        onCambio()
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setProcesando(false)
      }
    },
    [detalle, cerrar, onCambio]
  )

  const registrarPago = useCallback(
    async (datos: FormData) => {
      if (!detalle) return
      setProcesando(true)
      try {
        await matriculasApi.registrarPago(detalle.id, datos)
        toast.success('Pago registrado')
        cerrar()
        onCambio()
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setProcesando(false)
      }
    },
    [detalle, cerrar, onCambio]
  )

  const descargarFichaOficial = useCallback(async () => {
    if (!detalle) return
    setProcesando(true)
    try {
      const blob = await matriculasApi.fichaOficial(detalle.id)
      descargarBlob(blob, `ficha_oficial_${detalle.estudiante.codigoEstudiante}_${detalle.periodo.codigo}.pdf`)
      cerrar()
      onCambio()
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setProcesando(false)
    }
  }, [detalle, cerrar, onCambio])

  return { detalle, cursos, pago, cargando, procesando, abrir, cerrar, validar, registrarPago, descargarFichaOficial }
}
