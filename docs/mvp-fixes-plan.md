# Plan de fixes para MVP (Backend)

Objetivo: llevar el backend a un estado seguro y funcional para un MVP de produccion.

Formato: tareas priorizadas con descripcion breve (por que es importante y que soluciona).

## 1) Seguridad y autenticacion (P0)

- [ ] Remover datos sensibles de logs (passwords y tokens).
  - Importancia: evita filtraciones de credenciales en sistemas de observabilidad.
  - Soluciona: exposure de passwords en `CreateUserUseCase` y `LogInUserUseCase`.

- [ ] Agregar `cookie-parser` y asegurar lectura de cookies en `/auth/refresh`.
  - Importancia: el refresh token no funciona sin parsing de cookies.
  - Soluciona: refresh token roto por `req.cookies` undefined.

- [ ] Validar tipo de token en flujos de verify/reset (por ejemplo `type: "verify"` y `type: "reset"`).
  - Importancia: evita reutilizar access tokens en flujos sensibles.
  - Soluciona: escalamiento de privilegios en `VerifyEmailUseCase` y `ResetPasswordUseCase`.

- [ ] Bloquear cambios de password via `UpdateUser` sin password actual.
  - Importancia: evita que un token comprometido cambie password sin control.
  - Soluciona: bypass de seguridad en `UpdateUserUseCase`.

- [ ] Agregar rate limiting y lockout basico para `/auth/login` y `/auth/reset-password`.
  - Importancia: reduce ataques de fuerza bruta.
  - Soluciona: exposicion a credential stuffing y brute-force.

- [ ] Agregar headers de seguridad (helmet) y CORS estricto.
  - Importancia: reduce superficie de ataque en navegadores.
  - Soluciona: falta de hardening HTTP en el server.

## 2) Flujos funcionales faltantes (P0)

- [ ] Endpoint de "forgot password": genera token y envia email.
  - Importancia: flujo basico de recuperacion para MVP.
  - Soluciona: solo existe el consumo del token pero no su generacion.

- [ ] Endpoint de re-envio de verificacion de email.
  - Importancia: soporte a usuarios que no recibieron el correo.
  - Soluciona: bloqueo de usuarios sin verificacion.

- [ ] Persistencia y revocacion de refresh tokens (lista activa por usuario o jti).
  - Importancia: permite revocar sesiones y detectar reuse.
  - Soluciona: rotacion sin persistencia y sin revocacion real.

## 3) Bugs y consistencia (P1)

- [ ] Corregir schema de `ChangePass` para ObjectId (no UUID).
  - Importancia: el cambio de password falla siempre con ObjectId.
  - Soluciona: validacion incorrecta en `ChangePassSchema`.

- [ ] Normalizar ruta de `GET /users/me` y eliminar ruta temporal.
  - Importancia: API consistente para front y docs.
  - Soluciona: ruta `bin.usr-is-merged` temporal.

- [ ] Validar ObjectId en params (proyecto, task, team).
  - Importancia: evita 500 por cast errors de Mongo.
  - Soluciona: errores de runtime en controladores.

## 4) Observabilidad y resiliencia (P1)

- [ ] Manejo centralizado de errores (middleware) con respuestas seguras.
  - Importancia: evita fuga de mensajes internos.
  - Soluciona: respuestas inconsistentes y leakage de errores.

- [ ] Falla rapida si Mongo no conecta + healthcheck.
  - Importancia: detecta deployments rotos de inmediato.
  - Soluciona: server inicia sin DB conectada.

## 5) Calidad y cobertura (P2)

- [ ] Tests para los flujos nuevos (forgot, resend, refresh con cookies reales).
  - Importancia: asegura que auth no se rompa en cambios futuros.
  - Soluciona: cobertura incompleta en endpoints sensibles.

- [ ] Tests de validacion de permisos en proyectos y tasks.
  - Importancia: evita regresiones de autorizacion.
  - Soluciona: cobertura limitada en casos de acceso.
