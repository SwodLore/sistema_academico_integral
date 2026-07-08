import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUsuarios } from '@/hooks/useUsuarios'
import { ROLES } from '@/schemas/usuario'
import { ROL_LABELS, type Rol, type UsuarioAdmin } from '@/types'
import UsuariosTable from './components/UsuariosTable'
import UsuarioFormDialog from './components/UsuarioFormDialog'
import { Filter, Plus, Users } from 'lucide-react'

export default function UsuariosPage() {
  const { cargando, usuarios, filtroRol, setFiltroRol, especialidades, facultades, guardar, cambiarEstado } =
    useUsuarios()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null)

  function abrirNuevo() {
    setEditando(null)
    setModalAbierto(true)
  }

  function abrirEditar(usuario: UsuarioAdmin) {
    setEditando(usuario)
    setModalAbierto(true)
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
              <Users className="size-6 text-neutral-700" />
              Usuarios
            </h1>
            <p className="text-sm text-neutral-500">Gestiona las cuentas y roles del sistema</p>
          </div>
          <Button onClick={abrirNuevo} className="gap-2 sm:self-auto self-start">
            <Plus className="size-4" />
            Nuevo usuario
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Listado ({usuarios.length})</CardTitle>
                <CardDescription>Usuarios registrados en el sistema</CardDescription>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Filter className="size-4 text-neutral-500 shrink-0" />
                <select
                  className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm sm:w-[220px]"
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value as Rol | '')}
                >
                  <option value="">Todos los roles</option>
                  {ROLES.map((rol) => (
                    <option key={rol} value={rol}>{ROL_LABELS[rol]}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <p className="text-sm text-neutral-500 py-8 text-center">Cargando...</p>
            ) : usuarios.length === 0 ? (
              <p className="text-sm text-neutral-500 py-8 text-center">No hay usuarios.</p>
            ) : (
              <UsuariosTable usuarios={usuarios} onEditar={abrirEditar} onCambiarEstado={cambiarEstado} />
            )}
          </CardContent>
        </Card>
      </div>

      <UsuarioFormDialog
        abierto={modalAbierto}
        editando={editando}
        especialidades={especialidades}
        facultades={facultades}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
      />
    </div>
  )
}
