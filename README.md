# Quantum Projects API · MVP Backend de Usuarios

## Descripción del proyecto
Quantum Projects es el sistema interno de gestión que impulsa a Quantum MD. La base tecnológica es un backend construido con Node.js, TypeScript, MongoDB y los principios de Clean Architecture para mantener independencia entre capas.

El proyecto se encuentra en la fase **MVP Backend de Usuarios**. El objetivo actual es consolidar la identidad (registro, autenticación y verificación) y exponer un CRUD estable de perfiles. El próximo módulo será un **frontend en Angular**, pero todavía no existe implementación del lado del cliente; este README se enfoca únicamente en la API.

## Objetivo del MVP Usuarios
El alcance mínimo viable contempla únicamente:

- Registro de usuarios con hash seguro de contraseñas.
- Inicio de sesión con JWT firmado por la API.
- Envío y verificación de correos transaccionales (alta y recuperación).
- Flujo de verificación por email.
- CRUD básico de usuarios (crear, leer, actualizar, eliminar).
- Logger centralizado con posibilidad de enviar a Grafana/Loki.
- Servicio de envío de correos (templating HTML y adaptador SMTP).
- Arquitectura limpia y estable para extender módulos.

Deliberadamente **no incluye**: equipos, proyectos, roles avanzados, notificaciones internas, cargas de archivos masivas, integraciones estilo ClickUp/Trello, OAuth para login ni ningún frontend.

## Arquitectura (Clean Architecture)
La API se estructura como un monolito modular con dependencias que apuntan hacia el dominio. Las capas principales son:

| Capa | Responsabilidad | Ejemplos |
| --- | --- | --- |
| **Presentation** | Rutas HTTP, controladores y middlewares de entrada | `src/presentation/auth`, `src/presentation/user` |
| **Application (Use Cases)** | Orquesta reglas de negocio y coordina repositorios/servicios | `CreateUserUseCase`, `VerifyEmailUseCase` |
| **Domain** | Entidades, contratos y DTOs puros | `User`, `IUserRepository`, esquemas Zod |
| **Infrastructure** | Adaptadores técnicos: MongoDB, Nodemailer, JWT, logger | `UserDatasource`, `SecurityService`, `WinstonLogger` |

### Diagrama general
```mermaid
graph TD
  A[Controller] --> B[Use Case]
  B --> C[Repository]
  C --> D[Datasource]
  D --> E[(MongoDB)]
  B --> F[Services (Security/Email)]
  F --> G[Adapters (JWT, Nodemailer, Scrypt)]
```

### Flujo típico
1. El controlador recibe una request, valida DTOs con Zod y delega el caso de uso.
2. El caso de uso coordina repositorios y servicios (por ejemplo, hashing de contraseñas o generación de tokens).
3. El repositorio aplica reglas de negocio menores (p.ej. evitar duplicados) y delega en un datasource específico de Mongo/Typegoose.
4. Los servicios llaman adaptadores técnicos (JWT, Scrypt, Nodemailer) que encapsulan dependencias externas.
5. El logger (`WinstonLogger`) añade contexto por scope y puede enviar trazas a Loki/Grafana.

## Estado actual del desarrollo (MVP Usuarios)
Las tablas siguientes reflejan el avance real encontrado en el código fuente.

### Autenticación
| Feature | Estado | Notas |
| --- | --- | --- |
| Registro | ✓ Implementado | `POST /users` crea usuarios, hashea con Scrypt y dispara email de verificación (`CreateUserUseCase`). |
| Login | ⚠ En progreso | Existe `LoginUserUseCase`, pero no hay controlador ni ruta expuesta para entregar el JWT al cliente. |
| Envío de JWT | ⚠ En progreso | Generación disponible vía `SecurityService`/`JWTAdapter`, falta exponer respuesta en endpoints públicos. |
| Verificación por email | ✓ Implementado | Endpoint `GET /auth/verify-email/:token` marca al usuario como verificado. |
| Hash de contraseñas | ✓ Implementado | `SecurityService` con adaptador Scrypt (`ScryptSecurityAdapter`). |
| Manejo de errores | ⚠ En progreso | Controladores envuelven errores comunes, pero no existe middleware global ni códigos homogéneos. |
| Refresh token | ✗ Faltante | No hay contratos ni almacenamiento de refresh tokens. |

### Usuarios
| Feature | Estado | Notas |
| --- | --- | --- |
| Crear usuario | ✓ Implementado | Valida con Zod y envía verificación por email antes de persistir. |
| Obtener usuario actual | ⚠ En progreso | Hay `GET /users/:id`, pero no existe endpoint protegido que derive del JWT (`/me`). |
| Actualizar usuario | ✓ Implementado | `PUT /users/:id` permite actualizaciones parciales, aunque sin validaciones de ownership ni DTO estrictos. |
| Eliminar usuario | ✓ Implementado | `DELETE /users/:id`. |
| Validaciones | ⚠ En progreso | Se usa Zod para alta/actualización, pero no hay sanitización profunda ni verificación de duplicados en controladores. |

### Infraestructura
| Feature | Estado | Notas |
| --- | --- | --- |
| MongoDB + Typegoose | ✓ Implementado | Configuración en `MongoConfig` y modelos `UserModel`. |
| Adaptadores (JWT, Nodemailer, Scrypt) | ✓ Implementado | Capas desacopladas respetando Clean Architecture. |
| EmailService con templating | ✓ Implementado | Motor de plantillas HTML (`templateEngine.ts`) con caché simple. |
| Logger | ✓ Implementado | `WinstonLogger` con transporte Loki opcional y `logger.child()` por scope. |
| Seguridad (middlewares) | ✗ Faltante | No existe middleware de autenticación para proteger rutas ni medidas como Helmet/rate limiting. |
| Envío de correos | ✓ Implementado | `EmailService` y `NodemailerAdapter` listos, faltan plantillas personalizadas finales. |

## Configuración rápida
1. Crea un archivo `.env` basado en `env-template` e incluye variables críticas (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `SMTP_*`).
2. Instala dependencias y levanta el servidor en modo desarrollo:
   ```bash
   npm install
   npm run dev
   ```
3. Opcional: ejecuta `docker compose up --build` para levantar MongoDB + Loki + Grafana junto a la API.

## Próximos pasos inmediatos
- Exponer `POST /auth/login` que use `LoginUserUseCase` y retorne el JWT.
- Completar middleware de autenticación para proteger `/users` y derivar un endpoint `/users/me`.
- Finalizar plantillas HTML de correo (identidad Quantum MD) y flujo completo de verificación.
- Unificar manejo de errores y DTOs antes de abrir el consumo desde Angular.
