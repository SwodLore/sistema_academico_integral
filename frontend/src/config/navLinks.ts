import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Clock,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  TrendingUp,
  Users,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import type { Rol } from '@/store/auth.store'

export type NavLink = {
  to: string
  label: string
  icon: LucideIcon
}

export function getNavLinks(rol: Rol): NavLink[] {
  if (rol === 'ESTUDIANTE') {
    return [
      { to: '/matricula', label: 'Matrícula', icon: BookOpen },
      { to: '/notas', label: 'Mis Notas', icon: Award },
      { to: '/record', label: 'Récord Académico', icon: FileText },
      { to: '/certificados', label: 'Certificados', icon: LayoutDashboard },
    ]
  }

  if (rol === 'DOCENTE') {
    return [{ to: '/cursos', label: 'Mis Cursos', icon: BookOpen }]
  }

  if (rol === 'ADMINISTRADOR' || rol === 'DIRECCION') {
    return [
      { to: '/admin', label: 'Administración', icon: LayoutDashboard },
      { to: '/admin/carga-docente', label: 'Carga Docente', icon: UserCheck },
      { to: '/admin/certificados', label: 'Certificados', icon: Award },
      { to: '/admin/cursos', label: 'Cursos', icon: BookOpen },
      { to: '/admin/asignaciones', label: 'Asignar Docentes', icon: Calendar },
      { to: '/admin/horarios', label: 'Horarios', icon: Clock },
      { to: '/admin/actas', label: 'Actas de Notas', icon: ClipboardCheck },
      { to: '/admin/indicadores', label: 'Indicadores', icon: BarChart3 },
      { to: '/admin/reportes', label: 'Reportes', icon: FileBarChart },
      { to: '/admin/cohortes', label: 'Cohortes', icon: TrendingUp },
      { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
      {
        to: '/admin/facultades-especialidades',
        label: 'Facultades y Especialidades',
        icon: GraduationCap,
      },
    ]
  }

  return []
}
