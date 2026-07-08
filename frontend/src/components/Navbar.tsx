import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, BookOpen, Award, FileText, LayoutDashboard, Users, GraduationCap, User, ClipboardCheck, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (!user) return null

  const links = (() => {
    if (user.rol === 'ESTUDIANTE') {
      return [
        { to: '/matricula', label: 'Matrícula', icon: BookOpen },
        { to: '/notas', label: 'Mis Notas', icon: Award },
        { to: '/record', label: 'Récord Académico', icon: FileText },
        { to: '/certificados', label: 'Certificados', icon: LayoutDashboard },
      ]
    }
    if (user.rol === 'DOCENTE') {
      return [
        { to: '/cursos', label: 'Mis Cursos', icon: BookOpen },
      ]
    }
    if (user.rol === 'ADMINISTRADOR' || user.rol === 'DIRECCION') {
      return [
        { to: '/admin', label: 'Administración', icon: LayoutDashboard },
        { to: '/admin/cursos', label: 'Cursos', icon: BookOpen },
        { to: '/admin/asignaciones', label: 'Asignar Docentes', icon: Calendar },
        { to: '/admin/horarios', label: 'Horarios', icon: Clock },
        { to: '/admin/actas', label: 'Actas de Notas', icon: ClipboardCheck },
        { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
        { to: '/admin/facultades-especialidades', label: 'Facultades y Especialidades', icon: GraduationCap },
      ]
    }
    return []
  })()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center mr-8">
              <span className="text-xl font-bold bg-neutral-900 bg-clip-text text-transparent">
                UNCP
              </span>
              <span className="text-xs font-semibold ml-2 px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                Portal
              </span>
            </div>

            <div className="hidden sm:flex sm:space-x-8">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-neutral-900 text-neutral-900'
                        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-neutral-800">
                {user.nombres} {user.apellidos}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                <Badge variant={ROLE_VARIANTS[user.rol] ?? 'default'} className="px-1.5 py-0 text-[10px] uppercase font-bold tracking-wider">
                  {ROLE_LABELS[user.rol] ?? user.rol}
                </Badge>
              </div>
            </div>

            <div className="h-8 w-px bg-neutral-200" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-neutral-600 hover:text-neutral-900 gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Links */}
      <div className="sm:hidden border-t border-neutral-100 flex justify-around py-2 bg-neutral-50/50">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
