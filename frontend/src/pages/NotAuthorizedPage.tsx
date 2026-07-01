import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotAuthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <p className="text-8xl font-bold text-neutral-200 select-none">403</p>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-800">Acceso denegado</h1>
      <p className="mt-2 text-sm text-neutral-500 max-w-xs">
        No tienes los permisos necesarios para ver esta pagina.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button onClick={() => navigate('/')}>
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}
