# 1. Arquitectura general

## Visión general

El **Sistema Académico Integral** es una plataforma web para la gestión académica
de una universidad: matrícula, registro de notas, actas, reportes, indicadores y
emisión de certificados con código QR.

Usa una **arquitectura desacoplada cliente-servidor**: el frontend y el backend
son dos proyectos **independientes** que se comunican por una **API REST/JSON**.

- **Frontend** ([frontend/](../frontend/)) → React 19 + TypeScript + Vite (SPA). Es lo que ve el usuario.
- **Backend** ([sistema-academico/](../sistema-academico/)) → Spring Boot (Java 25). Expone la API y contiene la lógica de negocio.
- **Base de datos** → MySQL, accedida mediante el ORM Hibernate/JPA.

> No es un MVC monolítico con vistas del lado del servidor (tipo JSP). El backend
> sigue el patrón de **capas** (Controller → Service → Repository) y el frontend
> es una **SPA** que consume la API.

## Diagrama de arquitectura

```
   Usuarios (4 roles)
   Admin · Dirección · Docente · Estudiante
            │
            ▼
┌────────────────────────────┐        HTTP / JSON        ┌────────────────────────────┐        SQL         ┌───────────┐
│         FRONTEND           │   + Token JWT (axios)     │          BACKEND           │  (Hibernate/JPA)   │   MySQL   │
│  React 19 + TS + Vite      │ ────────────────────────► │  Spring Boot (Java 25)     │ ─────────────────► │  (16      │
│                            │ ◄──────────────────────── │  API REST                  │ ◄───────────────── │  tablas)  │
│  Pages · Components (Radix  │                           │  Controller → Service →    │                    │           │
│  + Tailwind) · React Query │                           │  Repository → Hibernate    │                    │           │
│  · Zustand · React Router  │                           │  Seguridad: JWT            │                    │           │
└────────────────────────────┘                           └────────────────────────────┘                    └───────────┘
        Vercel                                                     Render
```

## Flujo de una petición

```
Cliente (React) → Controller → Service → Repository → Hibernate → MySQL
                     ↑ DTOs                ↑ Entities
```

1. El usuario hace una acción en el frontend (ej. registrar notas).
2. `axios` envía la petición HTTP al backend con el **token JWT** en la cabecera.
3. El **Controller** recibe la petición y valida los datos.
4. El **Service** aplica la lógica de negocio.
5. El **Repository** consulta/guarda datos; **Hibernate** traduce a SQL sobre MySQL.
6. La respuesta vuelve como **JSON** y React actualiza la pantalla.

## Tecnologías principales

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Radix UI |
| Orquestación (cliente) | TanStack React Query, Zustand, axios |
| Backend | Java 25, Spring Boot, Spring Data JPA, Spring Security |
| ORM | Hibernate |
| Base de datos | MySQL |
| Seguridad | JWT (JSON Web Token) |
| Documentación API | Swagger / OpenAPI (springdoc) |
| Despliegue | Vercel (frontend) · Render (backend) |
