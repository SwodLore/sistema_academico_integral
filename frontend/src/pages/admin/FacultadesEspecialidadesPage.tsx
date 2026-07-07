import { useCatalogos } from '@/hooks/useCatalogos'
import FacultadCard from './components/FacultadCard'
import EspecialidadCard from './components/EspecialidadCard'

export default function FacultadesEspecialidadesPage() {
  const { facultades, especialidades, crearFacultad, crearEspecialidad } = useCatalogos()

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Facultades y Especialidades</h1>
          <p className="text-sm text-neutral-500">Registra las facultades y especialidades del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FacultadCard facultades={facultades} onCrear={crearFacultad} />
          <EspecialidadCard especialidades={especialidades} facultades={facultades} onCrear={crearEspecialidad} />
        </div>
      </div>
    </div>
  )
}
