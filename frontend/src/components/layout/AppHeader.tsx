import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, User } from 'lucide-react'
import { getNavSections } from '@/config/navLinks'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const ROLE_LABELS: Record<string, string> = {
  ESTUDIANTE: 'Estudiante',
  DOCENTE: 'Docente',
  ADMINISTRADOR: 'Administrador',
  DIRECCION: 'Dirección Académica',
}

const ROLE_VARIANTS: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  ESTUDIANTE: 'info',
  DOCENTE: 'success',
  ADMINISTRADOR: 'warning',
  DIRECCION: 'default',
}

export default function AppHeader() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  const secciones = getNavSections(user.rol)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden">
              <Menu className="size-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-border px-4 py-4 text-left">
              <SheetTitle className="flex items-center gap-2">
                <span>UNCP</span>
                <span className="rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                  Portal
                </span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-3">
              {secciones.map((seccion, i) => (
                <div key={seccion.titulo ?? i} className="flex flex-col gap-1">
                  {seccion.titulo && (
                    <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {seccion.titulo}
                    </p>
                  )}

                  {seccion.links.map((link) => {
                    const Icon = link.icon
                    const isActive = location.pathname === link.to

                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 md:hidden">
          <span className="text-xl font-bold text-foreground">UNCP</span>
          <span className="rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-sm font-semibold text-foreground">
            {user.nombres} {user.apellidos}
          </span>
          <div className="mt-0.5 flex items-center gap-1.5">
            <User className="size-3.5 text-muted-foreground" />
            <Badge
              variant={ROLE_VARIANTS[user.rol] ?? 'default'}
              className="px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider"
            >
              {ROLE_LABELS[user.rol] ?? user.rol}
            </Badge>
          </div>
        </div>

        <Separator orientation="vertical" className="hidden sm:block h-8" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  )
}
