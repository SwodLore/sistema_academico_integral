# 4. Base de datos, roles y módulos

## Base de datos

Motor: **MySQL**. Las tablas las genera automáticamente **Hibernate** a partir de
las clases `@Entity` del backend.

### Tablas: **16**

| # | Tabla | Descripción |
|---|-------|-------------|
| 1 | Usuario | Cuenta de acceso (correo, contraseña, rol) |
| 2 | Estudiante | Datos del estudiante |
| 3 | Docente | Datos del docente |
| 4 | Facultad | Facultades de la universidad |
| 5 | Especialidad | Especialidades por facultad |
| 6 | Curso | Cursos del plan de estudios |
| 7 | Horario | Horarios de clase |
| 8 | AsignacionDocente | Asignación de docentes a cursos |
| 9 | Matricula | Matrícula del estudiante en un periodo |
| 10 | DetalleMatricula | Cursos incluidos en cada matrícula |
| 11 | Nota | Notas del estudiante |
| 12 | ActaNota | Actas de notas |
| 13 | SolicitudDocumento | Solicitudes de certificados/documentos |
| 14 | Pago | Pagos / vouchers |
| 15 | LogAuditoria | Registro de auditoría de acciones |
| 16 | PeriodoAcademico | Periodos/semestres académicos |

> Además hay **7 enums** que **no son tablas** (son valores de estado guardados como
> columnas): `Rol`, `EstadoMatricula`, `EstadoNota`, `EstadoActa`,
> `EstadoSolicitud`, `TipoDocumento`, `DiaSemana`.

## Roles: **4**

Definidos en el enum `Rol`:

1. **ADMINISTRADOR** — gestiona usuarios, cursos, asignaciones y catálogos.
2. **DIRECCION** — consulta indicadores, reportes y valida actas.
3. **DOCENTE** — registra notas y gestiona sus actas.
4. **ESTUDIANTE** — se matricula, ve su récord y solicita documentos.

## Módulos

### Módulos del núcleo académico
- Autenticación / Login (JWT)
- Matrícula
- Notas
- Actas de notas
- Cursos y asignación docente
- Catálogos (facultades, especialidades, periodos)

### Módulos extra (valor agregado): **5**

1. **Auditoría** — registra las acciones de los usuarios (`LogAuditoria` + interceptor).
2. **Certificados / Solicitud de documentos** — genera **PDF con código QR** de verificación.
3. **Reportes** — reportes consolidados exportables.
4. **Indicadores / Dashboard** — gráficos e indicadores para el rol Dirección.
5. **Exportación** — exportar datos (Excel / PDF).
