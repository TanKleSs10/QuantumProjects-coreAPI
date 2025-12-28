# Task MVP - Lista de tareas

Objetivo: completar la implementacion del modulo Task (proyectos) para la primera fase del MVP, siguiendo Clean Architecture, DDD y el stack actual.

## Alcance funcional minimo

- [x] Definir estados base de Task (todo, in_progress, done, blocked) (Est. 1h)
- [x] Definir prioridades base (low, medium, high, urgent) (Est. 1h)
- [x] Definir campos minimos (title, description, status, priority, projectId, assigneeId, createdBy, dueDate, tags) (Est. 1h)
- [x] Definir reglas MVP: asignacion unica, transiciones validas, dueDate opcional, title requerido (Est. 2h)

## Domain

- [x] Crear entidad `Task` con invariantes (title requerido, status/priority validos) (Est. 3h)
- [x] Agregar metodos de dominio para cambio de estado y asignacion (Est. 2h)
- [x] Crear value objects `TaskStatus` y `TaskPriority` (Est. 2h)
- [x] Definir interfaz `TaskRepository` (Est. 1h)
- [x] Definir eventos `TaskCreated`, `TaskUpdated`, `TaskAssigned` (Est. 2h)
- [x] Definir DTOs de entrada/salida para casos de uso (Est. 2h)

## Application (Use Cases)

- [x] CreateTaskUseCase (Est. 3h)
- [x] UpdateTaskUseCase (title, description, priority, dueDate, tags) (Est. 3h)
- [x] ChangeTaskStatusUseCase (validar transiciones) (Est. 3h)
- [x] AssignTaskUseCase (validar miembro del equipo) (Est. 3h)
- [x] GetTaskByIdUseCase (Est. 2h)
- [x] ListTasksByProjectUseCase con filtros (status, priority, assignee) (Est. 3h)
- [x] Agregar validaciones de negocio y errores de dominio por caso (Est. 2h)

## Infrastructure

- [x] Definir schema/modelo Mongoose para Task (Est. 3h)
- [x] Validar modelo (constraints, defaults, required fields) (Est. 2h)
- [x] Implementar TaskMongoDataSource (Est. 3h)
- [x] Implementar TaskRepository con mapeos entity <-> persistence (Est. 3h)
- [x] Crear mapper Task (entity <-> persistence <-> DTO) (Est. 3h)
- [x] Agregar indices por projectId, status, assigneeId (Est. 1h)

## Presentation (HTTP)

- [x] POST /api/projects/:projectId/tasks (Est. 2h)
- [x] PATCH /api/tasks/:taskId (Est. 2h)
- [x] PATCH /api/tasks/:taskId/status (Est. 2h)
- [x] PATCH /api/tasks/:taskId/assign (Est. 2h)
- [x] GET /api/tasks/:taskId (Est. 1h)
- [x] GET /api/projects/:projectId/tasks (Est. 2h)
- [x] Validaciones de request (DTO + schema) (Est. 2h)
- [x] Manejo de errores consistente (404, 400, 409, 422) (Est. 2h)

## Integracion con Teams/Identity

- [x] Validar que el usuario pertenece al team del proyecto (Est. 2h)
- [x] Validar que el assignee es miembro del team (Est. 2h)
- [x] Validar permisos para crear y actualizar tareas (Est. 2h)

## Notifications

- [x] Emitir eventos para TaskCreated y TaskAssigned (Est. 2h)
- [ ] Integrar con worker BullMQ (si aplica) (Est. 3h) - pendiente: BullMQ no esta configurado en el proyecto

## Testing

- [x] Unit tests de entidad Task (invariantes y transiciones) (Est. 3h)
- [x] Unit tests de use cases (casos felices y errores) (Est. 4h)
- [ ] Integration tests de repositorio con Mongo (Est. 4h) - pendiente: no hay entorno Mongo para tests automatizados
- [x] E2E basicos de endpoints (Est. 4h)

## Documentacion

- [x] Documentar endpoints y ejemplos en `docs/api-endpoints.md` (Est. 2h)
- [x] Actualizar `docs/PROJECT.md` con alcance del modulo Task (Est. 1h)

## Observabilidad

- [x] Agregar logs estructurados en use cases clave (Est. 2h)
- [x] Agregar trazas para errores de validacion y permisos (Est. 2h)
