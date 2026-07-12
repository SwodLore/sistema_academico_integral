import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  procesando: boolean
  onRegistrar: (datos: FormData) => void
  titulo?: string
  textoBoton?: string
}

export default function RegistrarPagoForm({
  procesando,
  onRegistrar,
  titulo = 'Registrar pago',
  textoBoton = 'Registrar pago',
}: Props) {
  const [monto, setMonto] = useState('')
  const [numeroRecibo, setNumeroRecibo] = useState('')
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [comprobante, setComprobante] = useState<File | null>(null)

  const puedePagar = Number(monto) > 0 && numeroRecibo.trim() !== ''

  function registrar() {
    const datos = new FormData()
    datos.append('monto', monto)
    datos.append('numeroRecibo', numeroRecibo)
    datos.append('metodoPago', metodoPago)
    if (comprobante) datos.append('comprobante', comprobante)
    onRegistrar(datos)
  }

  return (
    <div className="mt-5 border-t pt-4 space-y-3">
      <p className="text-sm font-medium text-neutral-700">{titulo}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-neutral-500">Monto (S/.)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-neutral-500">Numero de recibo</label>
          <input
            type="text"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            value={numeroRecibo}
            onChange={(e) => setNumeroRecibo(e.target.value)}
            placeholder="REC-001"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-neutral-500">Metodo de pago</label>
        <select
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="EFECTIVO">Efectivo</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="TARJETA">Tarjeta</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-neutral-500">Comprobante (imagen, opcional)</label>
        <input
          type="file"
          accept="image/*"
          className="w-full text-sm"
          onChange={(e) => setComprobante(e.target.files?.[0] ?? null)}
        />
      </div>
      <Button className="w-full" disabled={procesando || !puedePagar} onClick={registrar}>
        {procesando ? 'Enviando...' : textoBoton}
      </Button>
    </div>
  )
}
