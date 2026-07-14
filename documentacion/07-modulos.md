# 7. Módulos del sistema (con capturas)

Capturas reales del sistema en funcionamiento. Cada módulo indica qué hace cada rol.

## 7.1 Módulo de Matrícula

- **Estudiante:** solicita matrícula y descarga su ficha oficial.
- **Administrador:** valida requisitos, registra pagos y genera la ficha oficial.
- **Dirección:** supervisa estadísticas de matrícula.

**Vista del estudiante — Mi Matrícula:**

![Matrícula del estudiante](img/estudiante-matricula.png)

**Vista del administrador — Solicitudes de Matrícula:**

![Solicitudes de matrícula (admin)](img/admin-matriculas.png)

## 7.2 Módulo de Cursos y Docentes

- **Docente:** visualiza cursos asignados, gestiona sílabos y ve su horario.
- **Administrador:** asigna docentes y gestiona horarios.
- **Dirección:** evalúa carga docente y cumplimiento del plan de estudios.

**Vista del docente — Mis Cursos Asignados:**

![Cursos asignados del docente](img/docente-cursos.png)

**Vista del docente — Mi Horario:**

![Horario del docente](img/docente-horario.png)

## 7.3 Módulo de Notas

- **Docente:** registra notas parciales y finales.
- **Estudiante:** consulta su hoja de notas por ciclo.
- **Administrador:** valida actas y consolida notas.
- **Dirección:** supervisa indicadores académicos.

**Vista del estudiante — Mis Notas:**

![Notas del estudiante](img/estudiante-notas.png)

## 7.4 Módulo de Récord Académico

Centraliza el historial de rendimiento. El estudiante ve su historial semestre por
semestre con sus indicadores (promedio ponderado acumulado, créditos aprobados y
cursos aprobados), y cada curso con sus notas, promedio y estado
(Aprobado / Desaprobado / Pendiente).

![Récord académico del estudiante](img/estudiante-record.png)

## 7.5 Módulo de Certificados y Documentos

Digitaliza la emisión de documentos oficiales con el flujo
**solicitud → autorización → emisión**, con **verificación por código QR**.

**Vista del estudiante — Mis Documentos:**

![Documentos del estudiante](img/estudiante-documentos.png)

**Vista del administrador — Emisión de certificados:**

![Certificados (admin)](img/admin-certificados.png)

## 7.6 Módulo de Administración y Seguridad

Controla quién puede hacer qué: define roles, registra todo lo que pasa (auditoría)
y bloquea accesos no autorizados.

**Gestión de usuarios y roles (administrador):**

![Usuarios y roles (admin)](img/admin-usuarios.png)

**Auditoría (dirección):**

![Auditoría (dirección)](img/direccion-auditoria.png)

## 7.7 Funcionalidades adicionales

- **Periodos académicos:** crear y activar el periodo (base de todo el sistema).
- **Facultades y especialidades:** estructura académica.
- **Mi perfil:** datos personales y cambio de contraseña.
- **Panel de Dirección e indicadores:** métricas y gráficos de gestión.

**Periodos académicos (admin):**

![Periodos académicos](img/admin-periodos.png)

**Facultades y especialidades (admin):**

![Facultades y especialidades](img/admin-facultades.png)

**Mi perfil:**

![Mi perfil](img/admin-perfil.png)

**Panel de Dirección:**

![Panel de dirección](img/direccion-panel.png)

**Indicadores (dirección):**

![Indicadores](img/direccion-indicadores.png)
