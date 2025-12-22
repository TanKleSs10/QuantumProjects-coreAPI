# Quantum Projects API

## Descripcion

Backend principal de Quantum Projects con arquitectura limpia (Clean Architecture) y enfoque modular. La API provee autenticacion, gestion de usuarios y equipos, y deja la base lista para los modulos de proyectos y notificaciones.

## Arquitectura

La API esta organizada en capas con dependencias hacia el dominio:

| Capa                    | Responsabilidad                                   | Ejemplos                                             |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| Presentation            | Rutas HTTP, controladores y validacion de entrada | `src/presentation/auth`, `src/presentation/team`     |
| Application (Use Cases) | Orquesta reglas de negocio y flujos               | `CreateTeamUseCase`, `LogInUserUseCase`              |
| Domain                  | Entidades, contratos y DTOs                       | `Team`, `User`, `CreateTeamDTO`                      |
| Infrastructure          | Adaptadores tecnicos y persistencia               | `TeamDatasource`, `SecurityService`, `WinstonLogger` |

## Modulos

- Identity & Access: registro, login, verificacion de email, refresh token.
- Users: lectura y actualizacion del perfil del usuario.
- Teams: creacion de equipos, membresias y roles.
- Projects y Notifications: definidos en el dominio, pendientes de endpoints MVP.

## Endpoints principales

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/verify-email/:token`
- `POST /auth/reset-password`
- `POST /auth/refresh`
- `POST /auth/logout`

Teams:

- `POST /teams`
- `GET /teams`
- `GET /teams/:id`
- `POST /teams/:id/members`
- `DELETE /teams/:id/members/:userId`
- `PATCH /teams/:id/members/:userId/promote`
- `PATCH /teams/:id/members/:userId/demote`

Users (base `/users/me`):

- `GET /users/me` (pendiente de normalizar; actualmente `/users/me/bin.usr-is-merged/`)
- `PUT /users/me`
- `PATCH /users/me/change-password`
- `DELETE /users/me`

## Configuracion rapida

1. Copia `.env-template` como `.env` y completa las variables necesarias.
2. Instala dependencias:

```bash
npm install
```

1. Ejecuta en desarrollo:

```bash
npm run dev
```

## Scripts

- `npm test` ejecuta tests unitarios e integracion (sin e2e).
- `npm run test:e2e` ejecuta tests e2e.
- `npm run build` compila a `dist/`.
- `npm start` construye y levanta la API.

## Tests e2e

Los e2e levantan un server local y pueden requerir permisos para abrir un socket. Si aparece el warning de `--localstorage-file`, ver la nota en `docs/e2e-warnings.md`.

## Notas

- El logger usa `logger.child()` por scope para trazas consistentes.
- La base del dominio sigue principios DDD para facilitar el escalado a microservicios.
