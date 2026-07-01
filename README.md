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
