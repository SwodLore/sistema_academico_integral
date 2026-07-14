# 5. Metodología — Scrum

El proyecto se desarrolló con **Scrum**, un marco de trabajo ágil basado en
entregas iterativas e incrementales. La gestión se hizo con **GitHub Issues** y
**GitHub Projects**.

## Enlaces de gestión

| Recurso | Enlace |
|---------|--------|
| Tablero del proyecto | https://github.com/users/SwodLore/projects/3 |
| Vista de tablero (Kanban) | https://github.com/users/SwodLore/projects/3/views/2 |
| Vista adicional (sprints/tabla) | https://github.com/users/SwodLore/projects/3/views/3 |
| Historias de usuario cerradas (Issues) | https://github.com/SwodLore/sistema_academico_integral/issues?q=is%3Aissue+state%3Aclosed |

## Cómo aplicamos Scrum

### 1. Historias de usuario (Product Backlog)

Cada requisito se registró como un **Issue de GitHub** con formato de **historia de
usuario**:

> *"Como [rol], quiero [funcionalidad], para [beneficio]."*

Cada historia incluye:
- **Criterios de aceptación** — condiciones que definen cuándo la historia está terminada.
- **Sprint** — a qué iteración pertenece.
- **Puntos de estimación (story points)** — el esfuerzo relativo de la historia.

El conjunto de todas las historias forma el **Product Backlog**.

### 2. Sprints

El trabajo se dividió en **sprints** (iteraciones de tiempo fijo). Al inicio de
cada sprint se seleccionan las historias del backlog que se van a desarrollar
(**Sprint Backlog**), priorizadas por valor.

### 3. Tablero (GitHub Projects)

En el tablero se visualiza el flujo de trabajo estilo **Kanban**, moviendo cada
historia por columnas de estado:

```
Todo  →  In Progress  →  Done
```

- **Vista de tablero (view 2):** seguimiento visual del avance del sprint.
- **Vista de tabla/sprints (view 3):** historias agrupadas por sprint y puntos,
  útil para medir la carga y el progreso.

### 4. Roles del equipo

El equipo (3 integrantes) cubrió los roles típicos de Scrum de forma compartida:
Product Owner (prioriza el backlog), Scrum Master (facilita el proceso) y el
Development Team (desarrolla las historias).

### 5. Incremento

Al cerrar cada historia (Issue → *Closed*) se obtiene un **incremento** funcional
del producto, verificable en la aplicación desplegada. Las historias cerradas son
la evidencia del trabajo completado.

## Resumen para exponer

> "Trabajamos con **Scrum**: cada requisito es una **historia de usuario** (Issue de
> GitHub) con **criterios de aceptación**, asignada a un **sprint** y estimada en
> **story points**. El avance se gestiona en un **tablero Kanban** de GitHub
> Projects, y cada historia cerrada representa un incremento funcional del sistema."
