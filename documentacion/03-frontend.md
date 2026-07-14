# 3. Frontend — React (SPA)

El frontend está en [frontend/](../frontend/) y es una **SPA (Single Page
Application)** hecha con **React 19 + TypeScript + Vite**. Consume la API REST del
backend.

## Organización de carpetas (`frontend/src/`)

| Carpeta | Qué contiene |
|---------|--------------|
| `pages/` | Las pantallas, agrupadas por módulo: `matricula/`, `notas/`, `actas/`, `reportes/`, `admin/`, `cohortes/`, `indicadores/`, `certificados/`… |
| `components/` | Componentes reutilizables: `ui/` (Radix UI + TailwindCSS), `layout/`, tablas, modales, `ProtectedRoute` |
| `api/` | Un archivo por módulo (`matriculas.ts`, `docentes.ts`…) que llama al backend con **axios** |
| `hooks/` | Hooks personalizados que envuelven las llamadas con **React Query** (`useLogin`, `useMatriculasAdmin`…) |
| `store/` | Estado global con **Zustand** (`auth.store.ts` — sesión y usuario) |
| `router/` | Rutas con **React Router 7** + `ProtectedRoute` (control de acceso por rol) |
| `schemas/` | Validación de formularios con **Zod** + React Hook Form |
| `types/` | Tipos TypeScript compartidos |

## Orquestación / comunicación con el backend

Esta es la parte que "coordina" el frontend con la API:

- **axios** (`api/axios.ts`) → cliente HTTP; inyecta el **token JWT** en cada petición.
- **TanStack React Query** → orquesta el estado del servidor: cachea, sincroniza y
  refresca los datos automáticamente sin recargar la página.
- **Zustand** → estado global del cliente (sesión / usuario logueado).
- **React Router 7** → navegación entre pantallas + rutas protegidas por rol.
- **Zod + React Hook Form** → validación de formularios en el cliente.

> En una frase: *React Query orquesta los datos del servidor, axios transporta las
> peticiones con el token JWT, y Zustand guarda la sesión.*

## Interfaz de usuario

- **TailwindCSS** para estilos.
- **Radix UI** para componentes accesibles (diálogos, selects, tabs, toasts…).
- **Recharts** para los gráficos de indicadores (rol Dirección).
- **lucide-react** para íconos y **sonner** para notificaciones.
