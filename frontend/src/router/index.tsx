import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import MatriculaPage from '@/pages/matricula/MatriculaPage'
import CursosPage from '@/pages/cursos/CursosPage'
import NotasPage from '@/pages/notas/NotasPage'
import RecordPage from '@/pages/record/RecordPage'
import CertificadosPage from '@/pages/certificados/CertificadosPage'
import AdminPage from '@/pages/admin/AdminPage'
import NotFoundPage from '@/pages/NotFoundPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/matricula', element: <MatriculaPage /> },
  { path: '/cursos', element: <CursosPage /> },
  { path: '/notas', element: <NotasPage /> },
  { path: '/record', element: <RecordPage /> },
  { path: '/certificados', element: <CertificadosPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '*', element: <NotFoundPage /> },
])

export default router
