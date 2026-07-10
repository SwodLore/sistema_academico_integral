import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import HomeRedirect from '@/components/HomeRedirect'
import LoginPage from '@/pages/auth/LoginPage'
import MatriculaPage from '@/pages/matricula/MatriculaPage'
import CursosPage from '@/pages/cursos/CursosPage'
import NotasPage from '@/pages/notas/NotasPage'
import RegistrarNotasPage from '@/pages/notas/RegistrarNotasPage'
import RecordPage from '@/pages/record/RecordPage'
import CertificadosPage from '@/pages/certificados/CertificadosPage'
import AdminPage from '@/pages/admin/AdminPage'
import UsuariosPage from '@/pages/admin/UsuariosPage'
import FacultadesEspecialidadesPage from '@/pages/admin/FacultadesEspecialidadesPage'
import AuditoriaPage from '@/pages/admin/AuditoriaPage'
import ActasPage from '@/pages/actas/ActasPage'
import CursosAdminPage from '@/pages/admin/cursos/CursosAdminPage'
import AsignacionesDocentesPage from '@/pages/admin/cursos/AsignacionesDocentesPage'
import IndicadoresPage from '@/pages/indicadores/IndicadoresPage'
import HorariosAdminPage from '@/pages/admin/cursos/HorariosAdminPage'
import CargaDocentePage from '@/pages/admin/CargaDocentePage'
import CertificadosAdminPage from '@/pages/admin/CertificadosAdminPage'
import ReportesPage from '@/pages/reportes/ReportesPage'
import CohortesPage from '@/pages/cohortes/CohortesPage'
import NotFoundPage from '@/pages/NotFoundPage'
import NotAuthorizedPage from '@/pages/NotAuthorizedPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/403', element: <NotAuthorizedPage /> },
  { path: '/', element: <HomeRedirect /> },

  {
    element: <ProtectedRoute roles={['ESTUDIANTE']} />,
    children: [
      { path: '/matricula', element: <MatriculaPage /> },
      { path: '/notas', element: <NotasPage /> },
      { path: '/record', element: <RecordPage /> },
      { path: '/certificados', element: <CertificadosPage /> },
    ],
  },

  {
    element: <ProtectedRoute roles={['DOCENTE']} />,
    children: [
      { path: '/cursos', element: <CursosPage /> },
      { path: '/cursos/:asignacionId/notas', element: <RegistrarNotasPage /> },
    ],
  },

  {
    element: <ProtectedRoute roles={['ADMINISTRADOR', 'DIRECCION']} />,
    children: [
      { path: '/admin', element: <AdminPage /> },
      { path: '/admin/carga-docente', element: <CargaDocentePage /> },
      { path: '/admin/certificados', element: <CertificadosAdminPage /> },
      { path: '/admin/actas', element: <ActasPage /> },
      { path: '/admin/indicadores', element: <IndicadoresPage /> },
      { path: '/admin/reportes', element: <ReportesPage /> },
      { path: '/admin/cohortes', element: <CohortesPage /> },
      { path: '/admin/usuarios', element: <UsuariosPage /> },
      { path: '/admin/facultades-especialidades', element: <FacultadesEspecialidadesPage /> },
      { path: '/admin/cursos', element: <CursosAdminPage /> },
      { path: '/admin/asignaciones', element: <AsignacionesDocentesPage /> },
      { path: '/admin/horarios', element: <HorariosAdminPage /> },
      { path: '/admin/auditoria', element: <AuditoriaPage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])

export default router
