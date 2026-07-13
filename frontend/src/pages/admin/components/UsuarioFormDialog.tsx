import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ROLES, USUARIO_FORM_VACIO, usuarioAForm, validarUsuario } from '@/schemas/usuario'
import { ROL_LABELS, type Especialidad, type Facultad, type Rol, type UsuarioAdmin, type UsuarioRequest } from '@/types'

interface Props {
  abierto: boolean
  editando: UsuarioAdmin | null
  especialidades: Especialidad[]
  facultades: Facultad[]
  onCerrar: () => void
  onGuardar: (id: number | null, datos: UsuarioRequest) => Promise<boolean>
}

export default function UsuarioFormDialog({ abierto, editando, especialidades, facultades, onCerrar, onGuardar }: Props) {
  const [form, setForm] = useState<UsuarioRequest>(USUARIO_FORM_VACIO)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!abierto) return
    setErrores({})
    setForm(editando ? usuarioAForm(editando) : USUARIO_FORM_VACIO)
  }, [abierto, editando])

  function actualizar<K extends keyof UsuarioRequest>(campo: K, valor: UsuarioRequest[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function guardar() {
    const erroresForm = validarUsuario(form)
    setErrores(erroresForm)
    if (Object.keys(erroresForm).length > 0) return

    setGuardando(true)
    const ok = await onGuardar(editando?.id ?? null, form)
    setGuardando(false)
    if (ok) onCerrar()
  }

  return (
    <Dialog open={abierto} onOpenChange={(a) => !a && onCerrar()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle>{editando ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        <DialogDescription>La contrasena inicial es el DNI del usuario.</DialogDescription>

        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-neutral-500">Nombres</label>
            <input
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              value={form.nombres}
              onChange={(e) => actualizar('nombres', e.target.value)}
            />
            {errores.nombres && <p className="text-xs text-red-600">{errores.nombres}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-neutral-500">Apellido paterno</label>
              <input
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                value={form.apellidoPaterno}
                onChange={(e) => actualizar('apellidoPaterno', e.target.value)}
              />
              {errores.apellidoPaterno && <p className="text-xs text-red-600">{errores.apellidoPaterno}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-500">Apellido materno</label>
              <input
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                value={form.apellidoMaterno}
                onChange={(e) => actualizar('apellidoMaterno', e.target.value)}
              />
              {errores.apellidoMaterno && <p className="text-xs text-red-600">{errores.apellidoMaterno}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-neutral-500">Email</label>
              <input
                type="email"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => actualizar('email', e.target.value)}
              />
              {errores.email && <p className="text-xs text-red-600">{errores.email}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-500">DNI</label>
              <input
                inputMode="numeric"
                maxLength={8}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                value={form.dni}
                onChange={(e) => actualizar('dni', e.target.value.replace(/\D/g, ''))}
              />
              {errores.dni && <p className="text-xs text-red-600">{errores.dni}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-500">Rol</label>
            <select
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              value={form.rol}
              onChange={(e) => actualizar('rol', e.target.value as Rol)}
            >
              {ROLES.map((rol) => (
                <option key={rol} value={rol}>{ROL_LABELS[rol]}</option>
              ))}
            </select>
          </div>

          {form.rol === 'ESTUDIANTE' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-3">
                <label className="text-xs text-neutral-500">Especialidad</label>
                <select
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={form.especialidadId ?? ''}
                  onChange={(e) => actualizar('especialidadId', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Seleccionar...</option>
                  {especialidades.map((esp) => (
                    <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                  ))}
                </select>
                {errores.especialidadId && <p className="text-xs text-red-600">{errores.especialidadId}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Ciclo</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={form.ciclo ?? ''}
                  onChange={(e) => actualizar('ciclo', e.target.value ? Number(e.target.value) : null)}
                />
                {errores.ciclo && <p className="text-xs text-red-600">{errores.ciclo}</p>}
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs text-neutral-500">Año de ingreso</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={form.anioIngreso ?? ''}
                  onChange={(e) => actualizar('anioIngreso', e.target.value ? Number(e.target.value) : null)}
                />
                {errores.anioIngreso && <p className="text-xs text-red-600">{errores.anioIngreso}</p>}
              </div>
            </div>
          )}

          {form.rol === 'DOCENTE' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Grado academico</label>
                <input
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={form.gradoAcademico ?? ''}
                  onChange={(e) => actualizar('gradoAcademico', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Facultad</label>
                <select
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={form.facultadId ?? ''}
                  onChange={(e) => actualizar('facultadId', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Seleccionar...</option>
                  {facultades.map((fac) => (
                    <option key={fac.id} value={fac.id}>{fac.nombre}</option>
                  ))}
                </select>
                {errores.facultadId && <p className="text-xs text-red-600">{errores.facultadId}</p>}
              </div>
            </div>
          )}

          <Button className="w-full mt-2" disabled={guardando} onClick={guardar}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
