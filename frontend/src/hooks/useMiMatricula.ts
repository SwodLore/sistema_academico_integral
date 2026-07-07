import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { matriculasApi } from '@/api'
import { getApiError } from '@/lib/apiError'
import { descargarBlob } from '@/lib/descargarBlob'
import type { CursoDisponible, CursosDisponibles, Matricula } from '@/types'

export function useMiMatricula() {
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [matricula, setMatricula] = useState<Matricula | null>(null)
  const [cursosMatricula, setCursosMatricula] = useState<CursoDisponible[]>([])
  const [oferta, setOferta] = useState<CursosDisponibles | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await matriculasApi.miMatricula()
        if (data.matricula) {
          setMatricula(data.matricula)
          setCursosMatricula(data.cursos ?? [])
        } else {
          setOferta(await matriculasApi.cursosDisponibles())
        }
      } catch (err) {
        toast.error(getApiError(err))
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  async function solicitar(cursosIds: number[]) {
    if (!oferta) return
    setEnviando(true)
    try {
      const nueva = await matriculasApi.solicitar({
        ciclo: oferta.ciclo,
        anio: oferta.anio,
        semestre: oferta.semestre,
        cursosIds,
      })
      setMatricula(nueva)
      setCursosMatricula(oferta.cursos.filter((c) => cursosIds.includes(c.cursoId)))
      toast.success('Solicitud de matricula enviada')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setEnviando(false)
    }
  }

  async function descargarFicha() {
    if (!matricula) return
    setDescargando(true)
    try {
      const blob = await matriculasApi.ficha(matricula.id)
      descargarBlob(blob, `ficha_${matricula.estudiante.codigoEstudiante}_${matricula.periodo.codigo}.pdf`)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setDescargando(false)
    }
  }

  return { cargando, enviando, descargando, matricula, cursosMatricula, oferta, solicitar, descargarFicha }
}
