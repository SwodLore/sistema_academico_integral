import { useEffect, useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { api } from '@/api/axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ROL_LABELS, type Rol, type Especialidad, type Facultad, type UsuarioAdmin, type UsuarioRequest } from '@/types'

const ROLES: Rol[] = ['ESTUDIANTE', 'DOCENTE', 'ADMINISTRADOR', 'DIRECCION']

const ROL_VARIANTS: Record<Rol, 'info' | 'success' | 'warning' | 'default'> = {
  ESTUDIANTE: 'info',
  DOCENTE: 'success',
  ADMINISTRADOR: 'warning',
  DIRECCION: 'default',
}

const FORM_VACIO: UsuarioRequest = {
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  email: '',
  dni: '',
  rol: 'ESTUDIANTE',
  especialidadId: null,
  ciclo: 1,
  anioIngreso: new Date().getFullYear(),
  gradoAcademico: '',
  facultadId: null,
}

function getMensajeError(err: unknown): string {
  const error = err as { response?: { data?: { message?: string } } }
  return error.response?.data?.message ?? 'Ocurrio un error, intenta de nuevo'
}

function validar(form: UsuarioRequest): Record<string, string> {
  const errores: Record<string, string> = {}
  if (!form.nombres.trim()) errores.nombres = 'Los nombres son obligatorios'
  if (!form.apellidoPaterno.trim()) errores.apellidoPaterno = 'El apellido paterno es obligatorio'
  if (!form.apellidoMaterno.trim()) errores.apellidoMaterno = 'El apellido materno es obligatorio'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errores.email = 'Correo no valido'
  if (!/^\d{8}$/.test(form.dni)) errores.dni = 'El DNI debe tener 8 digitos'
  if (form.rol === 'ESTUDIANTE') {
    if (!form.especialidadId) errores.especialidadId = 'Selecciona la especialidad'
    if (!form.ciclo || form.ciclo < 1 || form.ciclo > 10) errores.ciclo = 'Ciclo entre 1 y 10'
    if (!form.anioIngreso) errores.anioIngreso = 'Indica el anio de ingreso'
  }
  if (form.rol === 'DOCENTE' && !form.facultadId) errores.facultadId = 'Selecciona la facultad'
  return errores
}

const columnHelper = createColumnHelper<UsuarioAdmin>()

export default function UsuariosPage() {
  const [cargando, setCargando] = useState(true)
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [filtroRol, setFiltroRol] = useState('')
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [facultades, setFacultades] = useState<Facultad[]>([])

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [form, setForm] = useState<UsuarioRequest>(FORM_VACIO)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setCargando(true)
    try {
      const params = filtroRol ? { rol: filtroRol } : {}
      const res = await api.get<UsuarioAdmin[]>('/admin/usuarios', { params })
      setUsuarios(res.data)
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroRol])

  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const [esp, fac] = await Promise.all([
          api.get<Especialidad[]>('/especialidades'),
          api.get<Facultad[]>('/facultades'),
        ])
        setEspecialidades(esp.data)
        setFacultades(fac.data)
      } catch {
        // los catalogos son opcionales para la tabla
      }
    }
    cargarCatalogos()
  }, [])

  function abrirNuevo() {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setErrores({})
    setModalAbierto(true)
  }

  function abrirEditar(usuario: UsuarioAdmin) {
    setEditandoId(usuario.id)
    setErrores({})
    const partes = usuario.apellidos.trim().split(' ')
    setForm({
      nombres: usuario.nombres,
      apellidoPaterno: partes[0] ?? '',
      apellidoMaterno: partes.slice(1).join(' '),
      email: usuario.email,
      dni: usuario.dni ?? '',
      rol: usuario.rol,
      especialidadId: usuario.especialidadId ?? null,
      ciclo: usuario.ciclo ?? 1,
      anioIngreso: usuario.anioIngreso ?? new Date().getFullYear(),
      gradoAcademico: usuario.gradoAcademico ?? '',
      facultadId: usuario.facultadId ?? null,
    })
    setModalAbierto(true)
  }

  function actualizar<K extends keyof UsuarioRequest>(campo: K, valor: UsuarioRequest[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function guardar() {
    const erroresForm = validar(form)
    setErrores(erroresForm)
    if (Object.keys(erroresForm).length > 0) return

    setGuardando(true)
    try {
      if (editandoId) {
        await api.put(`/admin/usuarios/${editandoId}`, form)
        toast.success('Usuario actualizado')
      } else {
        await api.post('/admin/usuarios', form)
        toast.success(`Usuario creado. Entra con ${form.email} y su DNI como contrasena`)
      }
      setModalAbierto(false)
      cargar()
    } catch (err) {
      toast.error(getMensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(usuario: UsuarioAdmin) {
    try {
      await api.patch(`/admin/usuarios/${usuario.id}/estado`, null, {
        params: { activo: !usuario.activo },
      })
      toast.success(usuario.activo ? 'Usuario desactivado' : 'Usuario activado')
      cargar()
    } catch (err) {
      toast.error(getMensajeError(err))
    }
  }

  const columnas = useMemo(
    () => [
      columnHelper.accessor((u) => `${u.nombres} ${u.apellidos}`, {
        id: 'nombre',
        header: 'Nombre',
      }),
      columnHelper.accessor((u) => u.email, { id: 'email', header: 'Email' }),
      columnHelper.accessor((u) => u.codigoUsuario, { id: 'codigo', header: 'Codigo' }),
      columnHelper.accessor((u) => u.rol, {
        id: 'rol',
        header: 'Rol',
        cell: (info) => <Badge variant={ROL_VARIANTS[info.getValue()]}>{ROL_LABELS[info.getValue()]}</Badge>,
      }),
      columnHelper.accessor((u) => u.activo, {
        id: 'estado',
        header: 'Estado',
        cell: (info) => (
          <Badge variant={info.getValue() ? 'success' : 'destructive'}>
            {info.getValue() ? 'Activo' : 'Inactivo'}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => abrirEditar(row.original)}>
              Editar
            </Button>
            <Button
              size="sm"
              variant={row.original.activo ? 'destructive' : 'default'}
              onClick={() => cambiarEstado(row.original)}
            >
              {row.original.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        ),
      }),
    ],
    []
  )

  const tabla = useReactTable({
    data: usuarios,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  })

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
                onChange={(e) => setFiltroRol(e.target.value)}
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    {tabla.getHeaderGroups().map((grupo) => (
                      <tr key={grupo.id} className="border-b text-left">
                        {grupo.headers.map((header) => (
                          <th key={header.id} className="py-2 px-3 font-medium text-neutral-700">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {tabla.getRowModel().rows.map((fila) => (
                      <tr key={fila.id} className="border-b last:border-0 hover:bg-neutral-50">
                        {fila.getVisibleCells().map((celda) => (
                          <td key={celda.id} className="py-2 px-3 text-neutral-800">
                            {flexRender(celda.column.columnDef.cell, celda.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogTitle>{editandoId ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
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
                  <label className="text-xs text-neutral-500">Anio de ingreso</label>
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
              {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
