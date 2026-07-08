import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROL_VARIANTS } from '@/schemas/usuario'
import { ROL_LABELS, type UsuarioAdmin } from '@/types'
import { Mail, Pencil, Power, UserRound } from 'lucide-react'

const columnHelper = createColumnHelper<UsuarioAdmin>()

interface Props {
  usuarios: UsuarioAdmin[]
  onEditar: (usuario: UsuarioAdmin) => void
  onCambiarEstado: (usuario: UsuarioAdmin) => void
}

export default function UsuariosTable({ usuarios, onEditar, onCambiarEstado }: Props) {
  const columnas = useMemo(
    () => [
      columnHelper.accessor((u) => `${u.nombres} ${u.apellidos}`, { id: 'nombre', header: 'Nombre' }),
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
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onEditar(row.original)}>
              <Pencil className="size-3.5" />
              Editar
            </Button>
            <Button
              size="sm"
              variant={row.original.activo ? 'destructive' : 'default'}
              onClick={() => onCambiarEstado(row.original)}
            >
              <Power className="size-3.5" />
              {row.original.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        ),
      }),
    ],
    [onEditar, onCambiarEstado]
  )

  const tabla = useReactTable({
    data: usuarios,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm min-w-[760px]">
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

      <div className="grid gap-3 md:hidden">
        {usuarios.map((usuario) => (
          <article key={usuario.id} className="rounded-md border border-neutral-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-semibold text-neutral-900">
                  <UserRound className="size-4 text-neutral-500" />
                  {usuario.nombres} {usuario.apellidos}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-neutral-600 break-all">
                  <Mail className="size-4 shrink-0 text-neutral-500" />
                  {usuario.email}
                </p>
                <p className="mt-1 text-xs text-neutral-500">Codigo: {usuario.codigoUsuario}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={ROL_VARIANTS[usuario.rol]}>{ROL_LABELS[usuario.rol]}</Badge>
                <Badge variant={usuario.activo ? 'success' : 'destructive'}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onEditar(usuario)}>
                <Pencil className="size-3.5" />
                Editar
              </Button>
              <Button
                size="sm"
                variant={usuario.activo ? 'destructive' : 'default'}
                onClick={() => onCambiarEstado(usuario)}
              >
                <Power className="size-3.5" />
                {usuario.activo ? 'Desactivar' : 'Activar'}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
