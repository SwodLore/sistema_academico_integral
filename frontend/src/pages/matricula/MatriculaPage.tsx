import { useState } from 'react'
import { useMiMatricula } from '@/hooks/useMiMatricula'
import MatriculaEstadoCard from './components/MatriculaEstadoCard'
import SeleccionCursosCard from './components/SeleccionCursosCard'
import SilaboModal from '@/components/SilaboModal'

export default function MatriculaPage() {
  const {
    cargando,
    enviando,
    descargando,
    matricula,
    cursosMatricula,
    oferta,
    solicitar,
    descargarFicha,
    subirVoucher,
  } = useMiMatricula()

  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(null)

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {matricula ? (
          <MatriculaEstadoCard
            matricula={matricula}
            cursos={cursosMatricula}
            descargando={descargando}
            enviando={enviando}
            onDescargar={descargarFicha}
            onSubirVoucher={subirVoucher}
            onVerSilabo={setSelectedAsignacionId}
          />
        ) : (
          oferta && <SeleccionCursosCard oferta={oferta} enviando={enviando} onSolicitar={solicitar} />
        )}
      </div>

      {selectedAsignacionId !== null && (
        <SilaboModal
          isOpen={selectedAsignacionId !== null}
          onClose={() => setSelectedAsignacionId(null)}
          asignacionId={selectedAsignacionId}
          mode="read"
        />
      )}
    </div>
  )
}
