import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import MatriculaPage from '@/pages/matricula/MatriculaPage'
import CursosPage from '@/pages/cursos/CursosPage'
import NotasPage from '@/pages/notas/NotasPage'
import RecordPage from '@/pages/record/RecordPage'
import CertificadosPage from '@/pages/certificados/CertificadosPage'
import AdminPage from '@/pages/admin/AdminPage'
import NotFoundPage from '@/pages/NotFoundPage'
import NotAuthorizedPage from '@/pages/NotAuthorizedPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/403', element: <NotAuthorizedPage /> },
  { path: '/', element: <Navigate to="/matricula" replace /> },

  {
    element: <ProtectedRoute />,
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
    ],
  },

  {
    element: <ProtectedRoute roles={['ADMINISTRADOR', 'DIRECCION']} />,
    children: [
      { path: '/admin', element: <AdminPage /> },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])

export default router
