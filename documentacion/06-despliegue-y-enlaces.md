# 6. Despliegue y enlaces

## Despliegue

El proyecto está desplegado en la nube, con frontend y backend separados:

| Parte | Plataforma | URL |
|-------|-----------|-----|
| Frontend (React) | **Vercel** | https://sistema-academico-integral.vercel.app |
| Backend (Spring Boot) | **Render** | https://sistema-academico-integral.onrender.com |
| Base de datos | MySQL (servicio en la nube) | — |

> El despliegue es **directo** en cada plataforma (no se usan contenedores
> Kubernetes). El frontend consume la API del backend mediante la variable de
> entorno de la URL base, y el backend permite el origen del frontend por **CORS**.

> ⏳ El backend en Render (plan gratuito) puede tardar unos segundos en la primera
> petición si estaba inactivo (arranque en frío).

## Documentación de la API (Swagger)

- **Swagger UI (interactivo):** https://sistema-academico-integral.onrender.com/swagger-ui/index.html
- **OpenAPI (JSON):** https://sistema-academico-integral.onrender.com/v3/api-docs

## Todos los enlaces del proyecto

| Recurso | Enlace |
|---------|--------|
| 🚀 App desplegada (frontend) | https://sistema-academico-integral.vercel.app |
| 📘 Swagger (backend) | https://sistema-academico-integral.onrender.com/swagger-ui/index.html |
| 🖥️ Diapositivas (Canva) — *principal* | https://canva.link/axfecdkeaq766nb |
| 📄 Documentación (Word) — *principal* | https://docs.google.com/document/d/1x9VhUe96cSnaVeyvX6eqfPoxFNg5YLiAFp1ZZdvk1E0/edit |
| 📎 Diapositivas (PDF, respaldo) | [PRESENTACION.pdf](PRESENTACION.pdf) |
| 📎 Documentación (PDF, respaldo) | [DOCUMENTACION.pdf](DOCUMENTACION.pdf) |
| 🗂️ Tablero Scrum | https://github.com/users/SwodLore/projects/3 |
| 🗂️ Tablero — vista Kanban | https://github.com/users/SwodLore/projects/3/views/2 |
| 🗂️ Tablero — vista sprints | https://github.com/users/SwodLore/projects/3/views/3 |
| ✅ Historias de usuario (Issues) | https://github.com/SwodLore/sistema_academico_integral/issues?q=is%3Aissue+state%3Aclosed |
| 💻 Repositorio | https://github.com/SwodLore/sistema_academico_integral |

## Credenciales de prueba

Contraseña para todos: `123456`

| Correo | Rol |
|--------|-----|
| admin@test.com | ADMINISTRADOR |
| direccion@test.com | DIRECCION |
| docente1@test.com | DOCENTE |
| estudiante1@test.com | ESTUDIANTE |
