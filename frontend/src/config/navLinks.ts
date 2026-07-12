import {
  Award,
  BarChart3,
  BookOpen,
  ListChecks,
  PieChart,
  Calendar,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
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

export type NavSection = {
  titulo?: string
  links: NavLink[]
}

export function getNavSections(rol: Rol): NavSection[] {
  if (rol === 'ESTUDIANTE') {
    return [
      {
        links: [
          { to: '/matricula', label: 'Matrícula', icon: BookOpen },
          { to: '/notas', label: 'Mis Notas', icon: Award },
          { to: '/record', label: 'Récord Académico', icon: FileText },
          { to: '/certificados', label: 'Certificados', icon: LayoutDashboard },
        ],
      },
    ]
  }

  if (rol === 'DOCENTE') {
    return [
      {
        titulo: 'Docencia',
        links: [
          { to: '/cursos', label: 'Mis Cursos', icon: BookOpen },
          { to: '/docente/notas', label: 'Registro de Notas', icon: ClipboardList },
          { to: '/docente/silabos', label: 'Mis Sílabos', icon: FileText },
        ],
      },
      {
        titulo: 'Organización',
        links: [{ to: '/docente/horario', label: 'Mi Horario', icon: CalendarDays }],
      },
    ]
  }

  if (rol === 'ADMINISTRADOR' || rol === 'DIRECCION') {
    const secciones: NavSection[] = [
      {
        titulo: 'General',
        links: [{ to: '/admin', label: 'Administración', icon: LayoutDashboard }],
      },
      {
        titulo: 'Gestión académica',
        links: [
          { to: '/admin/cursos', label: 'Cursos', icon: BookOpen },
          { to: '/admin/asignaciones', label: 'Asignar Docentes', icon: Calendar },
          { to: '/admin/horarios', label: 'Horarios', icon: Clock },
          { to: '/admin/carga-docente', label: 'Carga Docente', icon: UserCheck },
        ],
      },
      {
        titulo: 'Actas y certificados',
        links: [
          { to: '/admin/actas', label: 'Actas de Notas', icon: ClipboardCheck },
          { to: '/admin/certificados', label: 'Certificados', icon: Award },
        ],
      },
      {
        titulo: 'Reportes y análisis',
        links: [
          { to: '/admin/indicadores', label: 'Indicadores', icon: BarChart3 },
          { to: '/admin/reportes', label: 'Reportes', icon: FileBarChart },
          { to: '/admin/cohortes', label: 'Cohortes', icon: TrendingUp },
          { to: '/admin/estadisticas-matricula', label: 'Estadísticas de Matrícula', icon: PieChart },
          { to: '/admin/cumplimiento-plan', label: 'Cumplimiento del Plan', icon: ListChecks },
        ],
      },
    ]

    if (rol === 'ADMINISTRADOR') {
      secciones.push({
        titulo: 'Administración y seguridad',
        links: [
          { to: '/admin/usuarios', label: 'Usuarios y Roles', icon: Users },
          {
            to: '/admin/facultades-especialidades',
            label: 'Facultades y Especialidades',
            icon: GraduationCap,
          },
          { to: '/admin/auditoria', label: 'Auditoría', icon: ScrollText },
        ],
      })
    }

    return secciones
  }

  return []
}

export function getNavLinks(rol: Rol): NavLink[] {
  return getNavSections(rol).flatMap((seccion) => seccion.links)
}
