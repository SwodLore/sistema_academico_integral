import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUsuarios } from '@/hooks/useUsuarios'
import { ROLES } from '@/schemas/usuario'
import { ROL_LABELS, type Rol, type UsuarioAdmin } from '@/types'
import UsuariosTable from './components/UsuariosTable'
import UsuarioFormDialog from './components/UsuarioFormDialog'

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Usuarios</h1>
            <p className="text-sm text-neutral-500">Gestiona las cuentas y roles del sistema</p>
          </div>
          <Button onClick={abrirNuevo}>Nuevo usuario</Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Listado ({usuarios.length})</CardTitle>
                <CardDescription>Usuarios registrados en el sistema</CardDescription>
              </div>
              <select
                className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value as Rol | '')}
              >
                <option value="">Todos los roles</option>
                {ROLES.map((rol) => (
                  <option key={rol} value={rol}>{ROL_LABELS[rol]}</option>
                ))}
              </select>
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
