# Sistema Académico Integral

Proyecto final del curso Desarrollo de Aplicaciones Web - Semestre IX  
Universidad Nacional del Centro del Perú - Facultad de Ingeniería de Sistemas

## Integrantes

- Poves Martinez Alessandro Piero
- Sulluchuco Vilcapoma Anyelo Roberto
- Cruz Cruz Alexander Jhon

## Tecnologías

- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Java Spring Boot
- Base de datos: MySQL

## Requisitos

- Node.js 18+
- Java 25
- MySQL 8+
- Maven (incluido en el proyecto con mvnw)

## Configuración de la base de datos

Crear la base de datos en MySQL:

```sql
CREATE DATABASE sistema_academico;
```

Editar el archivo `sistema-academico/src/main/resources/application.properties` con tus credenciales:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sistema_academico
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password
```

## Ejecutar el backend

```bash
cd sistema-academico
./mvnw spring-boot:run
```

El backend corre en `http://localhost:8080`

## Ejecutar el frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`

## Datos de prueba

Cada vez que inicias el backend, se borran todas las tablas y se crean de nuevo desde cero (`spring.jpa.hibernate.ddl-auto=create`), no hace falta correr scripts SQL.

Como las tablas quedan vacias despues de recrearse, en cada arranque se cargan datos de prueba automaticamente: facultades, especialidades, cursos, un periodo academico activo, docentes, estudiantes, matriculas y notas. Esto lo hace la clase `DataInitializer`.

Ojo: esto significa que cualquier dato que cargues manualmente (desde el frontend o la API) se pierde la proxima vez que reinicies el backend. Es un modo pensado para desarrollo y pruebas, no para produccion.

### Credenciales de prueba

Todas las contrasenas son `123456`.

| Correo | Rol |
|--------|-----|
| admin@test.com | ADMINISTRADOR |
| direccion@test.com | DIRECCION |
| docente1@test.com | DOCENTE |
| docente2@test.com | DOCENTE |
| estudiante1@test.com | ESTUDIANTE |
| estudiante2@test.com | ESTUDIANTE |
| estudiante3@test.com | ESTUDIANTE |
