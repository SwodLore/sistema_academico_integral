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
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEditar(row.original)}>
              Editar
            </Button>
            <Button
              size="sm"
              variant={row.original.activo ? 'destructive' : 'default'}
              onClick={() => onCambiarEstado(row.original)}
            >
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
  )
}
