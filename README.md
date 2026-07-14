# Sistema Académico Integral

Plataforma web para la gestión académica universitaria (matrícula, notas, actas, reportes y certificados).
Proyecto final — Desarrollo de Aplicaciones Web, Semestre IX · UNCP, Facultad de Ingeniería de Sistemas.

## 👥 Integrantes

- Poves Martinez Alessandro Piero
- Sulluchuco Vilcapoma Anyelo Roberto
- Cruz Cruz Alexander Jhon

## 🔗 Enlaces

| Recurso | Enlace |
|---------|--------|
| 🚀 App desplegada (frontend) | https://sistema-academico-integral.vercel.app |
| 📘 API / Swagger (backend) | https://sistema-academico-integral.onrender.com/swagger-ui/index.html |
| 🖥️ Diapositivas (Canva) | https://canva.link/axfecdkeaq766nb |
| 📄 Documentación (Word) | https://docs.google.com/document/d/1x9VhUe96cSnaVeyvX6eqfPoxFNg5YLiAFp1ZZdvk1E0/edit |
| 🗂️ Tablero Scrum (GitHub Projects) | https://github.com/users/SwodLore/projects/3 |
| ✅ Historias de usuario (Issues) | https://github.com/SwodLore/sistema_academico_integral/issues?q=is%3Aissue+state%3Aclosed |
| 📚 Documentación técnica completa | [documentacion/](documentacion/) |

> 📎 Respaldo en PDF (por si los enlaces no cargan): diapositivas en
> [PRESENTACION.pdf](documentacion/PRESENTACION.pdf) y documentación en
> [DOCUMENTACION.pdf](documentacion/DOCUMENTACION.pdf).

## 🛠️ Stack

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS
- **Backend:** Java 25 + Spring Boot (API REST)
- **Base de datos:** MySQL (ORM Hibernate/JPA)
- **Seguridad:** JWT
- **Metodología:** Scrum

## ▶️ Cómo ejecutar (local)

**Backend** (necesita MySQL con una BD `sistema_academico`):

```bash
cd sistema-academico
./mvnw spring-boot:run          # http://localhost:8080
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

> Al iniciar, el backend recrea las tablas y carga datos de prueba automáticamente
> (clase `DataInitializer`). No hace falta correr scripts SQL.

## 🔑 Credenciales de prueba

| Correo | Contraseña | Rol |
|--------|------------|-----|
| admin@test.com | `123456` | ADMINISTRADOR |
| direccion@test.com | `123456` | DIRECCION |
| docente1@test.com | `123456` | DOCENTE |
| estudiante1@test.com | `123456` | ESTUDIANTE |

## 📖 Más información

La explicación detallada de arquitectura, backend, frontend, base de datos y
metodología Scrum está en la carpeta **[documentacion/](documentacion/)**.