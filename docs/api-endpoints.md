# Quantum Projects Core API - Endpoints y Schemas

Documento generado a partir de las rutas y DTOs actuales en el codigo.

## Base URL

- Base: `/api/v1`
- Ejemplo de host local: `http://localhost:3000/api/v1`

## Autenticacion

- Se usa `Authorization: Bearer <access_token>` para endpoints protegidos.
- El `refresh_token` se entrega como cookie `refresh_token` (httpOnly).
- Nota: Los controladores de usuarios y equipos usan `req.userId` y ya estan protegidos por middleware de auth.

## Formato de respuesta comun

- Exitoso:
  - `{ "success": true, "data": <payload>, "message"?: string, "token"?: string }`
- Error:
  - `{ "success": false, "message": string, "errors"?: any, "code"?: string }`

## Schemas base (DTOs)

### CreateUserDTO (registro)

```json
{
  "name": "string (min 1)",
  "email": "string (email valido)",
  "password": "string (min 8)",
  "avatarUrl": "string (url, opcional)",
  "bio": "string (max 500, opcional)",
  "teamIds": "string[] (opcional, default [])",
  "projectIds": "string[] (opcional, default [])",
  "notificationIds": "string[] (opcional, default [])"
}
```

### LogInDTO

```json
{
  "email": "string (email valido)",
  "password": "string (min 8)"
}
```

### UpdateUserDTO

```json
{
  "name": "string (opcional)",
  "email": "string (email valido, opcional)",
  "password": "string (min 8, opcional)",
  "avatarUrl": "string (url, opcional)",
  "bio": "string (max 500, opcional)",
  "teamIds": "string[] (opcional)",
  "projectIds": "string[] (opcional)",
  "notificationIds": "string[] (opcional)"
}
```

### ChangePassDTO (cambio de password)

```json
{
  "currentPassword": "string (min 8)",
  "newPassword": "string (min 8)"
}
```

### CreateTeamDTO

```json
{
  "name": "string (min 1)",
  "description": "string (max 500, opcional)"
}
```

### InviteMemberDTO

```json
{
  "userId": "string",
  "role": "admin | member"
}
```

## Schemas de respuesta

### User (dominio)

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string (hash)",
  "isVerified": "boolean",
  "avatarUrl": "string | undefined",
  "bio": "string | undefined",
  "teamIds": "string[]",
  "projectIds": "string[]",
  "notificationIds": "string[]",
  "createdAt": "string (ISO)",
  "updatedAt": "string (ISO)"
}
```

### UserLoginInfo

```json
{
  "id": "string",
  "name": "string",
  "email": "string"
}
```

### Team (dominio)

```json
{
  "id": "string",
  "name": "string",
  "ownerId": "string",
  "description": "string | undefined",
  "members": [
    {
      "userId": "string",
      "role": "owner | admin | member"
    }
  ]
}
```

## Endpoints

### Auth

#### POST /auth/register

Registro de usuario y envio de email de verificacion.

- Body: `CreateUserDTO`
- Response 201:

```json
{
  "success": true,
  "data": { "user": { "...": "User" } },
  "message": "Check your email to verify your account"
}
```

- Curl:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "password": "supersecret123",
    "avatarUrl": "https://example.com/avatar.png",
    "bio": "Math & computing"
  }'
```

#### GET /auth/verify-email/:token

Verifica el email del usuario.

- Params: `token` (string)
- Response 200:

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": { "id": "string", "email": "string", "isVerified": true }
}
```

- Curl:

```bash
curl http://localhost:3000/api/v1/auth/verify-email/<token>
```

#### POST /auth/login

Inicia sesion y entrega access token. El refresh token se setea como cookie.

- Body: `LogInDTO`
- Response 200:

```json
{
  "success": true,
  "data": { "user": { "...": "UserLoginInfo" } },
  "token": "access_token"
}
```

- Curl:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ada@example.com",
    "password": "supersecret123"
  }'
```

#### POST /auth/reset-password

Actualiza password usando token de recuperacion.

- Body:

```json
{
  "token": "string",
  "password": "string (min 8)"
}
```

- Response 200:

```json
{ "success": true, "message": "Password updated successfully" }
```

- Curl:

```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<reset_token>",
    "password": "newpassword123"
  }'
```

#### POST /auth/refresh

Rota refresh token (cookie) y devuelve nuevo access token.

- Cookies: `refresh_token`
- Response 200:

```json
{ "success": true, "token": "access_token" }
```

- Curl:

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  --cookie "refresh_token=<refresh_token>"
```

#### POST /auth/logout

Limpia la cookie `refresh_token`.

- Response 200:

```json
{ "success": true, "message": "Logged out successfully" }
```

- Curl:

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  --cookie "refresh_token=<refresh_token>"
```

### Users

#### GET /users/me/bin.usr-is-merged/

Obtiene el usuario actual (requiere auth).

- Headers: `Authorization: Bearer <access_token>`
- Response 200:

```json
{ "success": true, "data": { "...": "User" } }
```

- Curl:

```bash
curl http://localhost:3000/api/v1/users/me/bin.usr-is-merged/ \
  -H "Authorization: Bearer <access_token>"
```

#### PUT /users/me/

Actualiza el usuario actual (requiere auth).

- Headers: `Authorization: Bearer <access_token>`
- Body: `UpdateUserDTO`
- Response 200:

```json
{ "success": true, "data": { "...": "User" } }
```

- Curl:

```bash
curl -X PUT http://localhost:3000/api/v1/users/me/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ada Lovelace",
    "bio": "Updated bio"
  }'
```

#### PATCH /users/me/change-password

Cambia la password del usuario actual (requiere auth).

- Headers: `Authorization: Bearer <access_token>`
- Body: `ChangePassDTO`
- Response 200:

```json
{ "success": true, "message": "Password changed successfully" }
```

- Curl:

```bash
curl -X PATCH http://localhost:3000/api/v1/users/me/change-password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "supersecret123",
    "newPassword": "newpassword123"
  }'
```

#### DELETE /users/me/

Elimina el usuario autenticado (requiere auth).

- Headers: `Authorization: Bearer <access_token>`
- Response 200:

```json
{ "success": true, "message": "User deleted successfully" }
```

- Curl:

```bash
curl -X DELETE http://localhost:3000/api/v1/users/me/ \
  -H "Authorization: Bearer <access_token>"
```

### Teams

Permisos:

- Solo el owner puede agregar, remover, promover o degradar miembros.
- Un miembro puede salir del equipo (auto-removerse).
- Solo miembros (incluido owner) pueden ver un team por id.

#### POST /teams/

Crea un equipo (requiere auth).

- Headers: `Authorization: Bearer <access_token>`
- Body: `CreateTeamDTO`
- Response 201:

```json
{ "success": true, "data": { "...": "Team" } }
```

- Curl:

```bash
curl -X POST http://localhost:3000/api/v1/teams/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Core Team",
    "description": "Equipo principal"
  }'
```

#### GET /teams/

Lista equipos por usuario (requiere auth).

- Headers: `Authorization: Bearer <access_token>`
- Response 200:

```json
{ "success": true, "data": [{ "...": "Team" }] }
```

- Curl:

```bash
curl http://localhost:3000/api/v1/teams/ \
  -H "Authorization: Bearer <access_token>"
```

#### GET /teams/:id

Obtiene un equipo por id (solo miembros del team).

- Params: `id`
- Response 200:

```json
{ "success": true, "data": { "...": "Team" } }
```

- Curl:

```bash
curl http://localhost:3000/api/v1/teams/<teamId> \
  -H "Authorization: Bearer <access_token>"
```

#### POST /teams/:id/members

Agrega un miembro al equipo.

- Params: `id` (teamId)
- Body: `InviteMemberDTO`
- Response 200:

```json
{ "success": true, "data": { "...": "Team" } }
```

- Curl:

```bash
curl -X POST http://localhost:3000/api/v1/teams/<teamId>/members \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<userId>",
    "role": "member"
  }'
```

#### DELETE /teams/:id/members/:userId

Elimina un miembro del equipo. Solo owner, o el mismo miembro puede salir.

- Params: `id` (teamId), `userId`
- Response 200:

```json
{ "success": true, "data": { "...": "Team" } }
```

- Curl:

```bash
curl -X DELETE http://localhost:3000/api/v1/teams/<teamId>/members/<userId> \
  -H "Authorization: Bearer <access_token>"
```

#### PATCH /teams/:id/members/:userId/promote

Promueve a admin.

- Params: `id` (teamId), `userId`
- Response 200:

```json
{ "success": true, "data": { "...": "Team" } }
```

- Curl:

```bash
curl -X PATCH http://localhost:3000/api/v1/teams/<teamId>/members/<userId>/promote \
  -H "Authorization: Bearer <access_token>"
```

#### PATCH /teams/:id/members/:userId/demote

Degrada a member.

- Params: `id` (teamId), `userId`
- Response 200:

```json
{ "success": true, "data": { "...": "Team" } }
```

- Curl:

```bash
curl -X PATCH http://localhost:3000/api/v1/teams/<teamId>/members/<userId>/demote \
  -H "Authorization: Bearer <access_token>"
```

### Misc

#### GET /welcome

Respuesta simple de texto.

- Response 200: `Welcome to the Quantum Projects API!`
- Curl:

```bash
curl http://localhost:3000/api/v1/welcome
```

## Notas tecnicas

- Las respuestas de `User` incluyen el campo `password` (hash) segun el dominio actual.
- `User.createdAt` y `User.updatedAt` se serializan como ISO string al responder JSON.
- Endpoints de usuarios y equipos fallaran si no se monta el middleware de autenticacion para poblar `req.userId`.
