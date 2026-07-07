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
import ActasPage from '@/pages/actas/ActasPage'
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
      { path: '/admin/actas', element: <ActasPage /> },
      { path: '/admin/usuarios', element: <UsuariosPage /> },
      { path: '/admin/facultades-especialidades', element: <FacultadesEspecialidadesPage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])

export default router
