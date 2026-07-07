import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ESTADO_MATRICULA_LABELS, ESTADO_MATRICULA_VARIANTS, type Matricula } from '@/types'

const columnHelper = createColumnHelper<Matricula>()

interface Props {
  solicitudes: Matricula[]
  onVerDetalle: (matricula: Matricula) => void
}

export default function SolicitudesTable({ solicitudes, onVerDetalle }: Props) {
  const columnas = useMemo(
    () => [
      columnHelper.accessor((m) => `${m.estudiante.usuario.nombres} ${m.estudiante.usuario.apellidos}`, {
        id: 'estudiante',
        header: 'Estudiante',
      }),
      columnHelper.accessor((m) => m.estudiante.codigoEstudiante, { id: 'codigo', header: 'Codigo' }),
      columnHelper.accessor((m) => m.estudiante.especialidad.nombre, { id: 'especialidad', header: 'Especialidad' }),
      columnHelper.accessor((m) => m.estudiante.cicloActual, { id: 'ciclo', header: 'Ciclo' }),
      columnHelper.accessor((m) => m.periodo.codigo, { id: 'periodo', header: 'Periodo' }),
      columnHelper.accessor((m) => m.estado, {
        id: 'estado',
        header: 'Estado',
        cell: (info) => (
          <Badge variant={ESTADO_MATRICULA_VARIANTS[info.getValue()]}>
            {ESTADO_MATRICULA_LABELS[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <Button size="sm" variant="outline" onClick={() => onVerDetalle(row.original)}>
            Ver detalle
          </Button>
        ),
      }),
    ],
    [onVerDetalle]
  )

  const tabla = useReactTable({
    data: solicitudes,
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
