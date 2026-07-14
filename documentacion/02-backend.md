# 2. Backend — Spring Boot por capas

El backend está en [sistema-academico/](../sistema-academico/) y usa **Spring Boot con Java 25**.
Sigue una **arquitectura por capas**: cada carpeta del paquete
`com.universidad.sistema_academico` es una responsabilidad distinta.

## Organización de carpetas

| Carpeta | Responsabilidad | Rol en el patrón |
|---------|-----------------|------------------|
| `controller/` | 18 `@RestController` que reciben las peticiones HTTP, validan y devuelven JSON | **Controller** |
| `service/` | Lógica de negocio: cálculo de notas, generación de PDF, cumplimiento del plan | Servicio |
| `repository/` | Acceso a datos con Spring Data JPA (interfaces `JpaRepository`) | Acceso a datos |
| `entity/` | Clases `@Entity` mapeadas a tablas de MySQL + enums de estado | **Model** |
| `dto/` | Objetos de transferencia (Request/Response), separados de las entidades | — |
| `security/` | Autenticación con JWT (`JwtAuthFilter`, `JwtUtil`, `UserDetailsServiceImpl`) | Seguridad |
| `config/` | CORS, Swagger/OpenAPI, interceptor de auditoría, carga inicial de datos | Configuración |

## Por qué usamos DTOs

Los **DTO** (Data Transfer Object) separan lo que viaja por la API de las
entidades de la base de datos. Ventajas:

- No exponemos la estructura interna de la BD al cliente.
- Podemos enviar exactamente los campos que la pantalla necesita.
- Evita problemas de serialización con relaciones de Hibernate.

## Persistencia: Hibernate / JPA

- **Hibernate** es el **ORM** (Object-Relational Mapping): traduce las clases Java
  de `entity/` a tablas de MySQL. **No escribimos SQL a mano.**
- Viene incluido en `spring-boot-starter-data-jpa` (Hibernate es la implementación
  por defecto de JPA).
- Configuración en `application.properties`: `spring.jpa.hibernate.ddl-auto`
  (Hibernate crea las tablas) y `spring.datasource.url` apunta a MySQL.

> ⚠️ Aclaración: usamos **Hibernate** (ORM), **no Kubernetes** (orquestador de
> contenedores). Son cosas distintas; el proyecto no usa Kubernetes.

## Seguridad — JWT

1. El usuario inicia sesión (`AuthController`) y recibe un **token JWT**.
2. En cada petición siguiente, el frontend envía ese token en la cabecera.
3. `JwtAuthFilter` valida el token antes de dejar pasar la petición.
4. Cada rol (ADMINISTRADOR, DIRECCION, DOCENTE, ESTUDIANTE) tiene acceso a
   endpoints distintos.

## Librerías destacadas (pom.xml)

| Librería | Para qué |
|----------|----------|
| `spring-boot-starter-data-jpa` | ORM Hibernate + repositorios |
| `spring-boot-starter-security` + `jjwt` | Seguridad y tokens JWT |
| `spring-boot-starter-validation` | Validación de datos de entrada |
| `openpdf` + `qrcodegen` | Certificados en PDF con código QR de verificación |
| `springdoc-openapi` | Documentación de la API (Swagger UI) |
| `mysql-connector-j` | Driver de MySQL |
| `lombok` | Reduce código repetitivo (getters/setters) |

## Documentación de la API (Swagger)

El backend expone su documentación interactiva:

- **Swagger UI:** https://sistema-academico-integral.onrender.com/swagger-ui/index.html
- **Especificación OpenAPI (JSON):** https://sistema-academico-integral.onrender.com/v3/api-docs
