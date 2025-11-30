# Análisis Técnico de Quantum Projects – Arquitectura, Seguridad y DI

## Índice

1. [Resumen general](#resumen-general)
2. [Estructura de carpetas y modularidad](#estructura-de-carpetas-y-modularidad)
3. [Análisis por capas y componentes](#análisis-por-capas-y-componentes)
4. [Separación de capas y consistencia de Clean Architecture](#separación-de-capas-y-consistencia-de-clean-architecture)
5. [Flujo de autenticación (Access + Refresh Token)](#flujo-de-autenticación-access--refresh-token)
6. [Evaluación de seguridad](#evaluación-de-seguridad)
7. [Middleware de autenticación y permisos](#middleware-de-autenticación-y-permisos)
8. [Patrón de inyección de dependencias y factorías](#patrón-de-inyección-de-dependencias-y-factorías)
9. [Olores de código y riesgos detectados](#olores-de-código-y-riesgos-detectados)
10. [Correcciones aplicadas: instancias únicas](#correcciones-aplicadas-instancias-únicas)
11. [Propuesta de arquitectura con DI/Factories](#propuesta-de-arquitectura-con-difactories)
12. [Recomendaciones adicionales de arquitectura](#recomendaciones-adicionales-de-arquitectura)
13. [Pasos sugeridos para afianzar la DI](#pasos-sugeridos-para-afianzar-la-di)
14. [Ejemplo de arquitectura ideal](#ejemplo-de-arquitectura-ideal)
15. [Conclusión](#conclusión)

## Resumen general

El proyecto sigue una **arquitectura en capas inspirada en Clean Architecture y DDD** con separación visible entre `domain`, `application`, `presentation` e `infrastructure`. Existe una buena base de entidades (`User`), casos de uso de autenticación/usuarios y adaptadores para seguridad (Scrypt + JWT) y correo (Nodemailer). Sin embargo, se detectaron **creaciones repetidas de instancias** dentro de middlewares y routers, y algunas dependencias de infraestructura accedidas directamente desde capas superiores. Se añadieron **factorías singleton** para normalizar la inyección de dependencias y evitar fugas de memoria o inconsistencias entre requests.

## Estructura de carpetas y modularidad

- `src/domain`: entidades (`User`), DTOs y puertos (interfaces) para repositorios, seguridad y correo.
- `src/application`: casos de uso (`LogInUserUseCase`, `VerifyEmailUseCase`, etc.) y middlewares (`authMiddleware`).
- `src/presentation`: controladores y rutas Express separadas por contexto (`auth`, `user`).
- `src/infrastructure`: adaptadores (Scrypt, JWT, Nodemailer), repositorios (User), servicios (SecurityService, EmailService), datasources y logs. Se agregó `infrastructure/factories` para exponer singletons reutilizables.
- `src/config` y `src/presentation/server.ts` centralizan configuración de entorno y servidor.

## Análisis por capas y componentes

### Dominio

- `User` aplica un patrón de entidad rico con método `fromObject` para normalizar datos y validaciones mínimas. Falta encapsular validaciones de negocio (ej. reglas de contraseña) para reducir duplicación en casos de uso.
- Puertos `ISecurityAdapter`, `ITokenAdapter`, `IMailAdapter` e `IUserRepository` están definidos y se respetan en infraestructura, lo cual facilita el reemplazo de implementaciones.

### Casos de uso

- `LogInUserUseCase` aplica verificación de credenciales y genera **access** y **refresh tokens** con expiraciones diferenciadas (15m y 7d). Carece de rotación o persistencia de refresh tokens, lo que limita revocación.
- Casos de uso de usuario (crear, obtener, actualizar, eliminar) orquestan repositorio, seguridad y correo. Se instancian en controladores por request, lo que es aceptable pero podría beneficiarse de factorías para pruebas.

### Controladores

- `AuthController` y `UserController` manejan validaciones con Zod y traducen errores de dominio a respuestas HTTP. La lógica de construcción de casos de uso está dentro del controlador; podría extraerse a factories/composición en rutas.

### Adaptadores y servicios

- Adaptadores de seguridad (`ScryptSecurityAdapter`, `JWTAdapter`) y correo (`NodemailerAdapter`) implementan puertos del dominio. `SecurityService` y `EmailService` agregan logging y composición de adaptadores.

### Middlewares

- `authMiddleware` valida cabecera `Authorization` y adjunta `userId` al request tras verificar el token. Antes creaba servicios por request; ahora depende de factoría.

### Factorías

- Se añadieron factorías en `src/infrastructure/factories` para instanciar una sola vez seguridad, correo y repositorio de usuarios, evitando duplicación en rutas y middlewares.

## Separación de capas y consistencia de Clean Architecture

- Las dependencias generalmente apuntan hacia el dominio (repositorio implementa `IUserRepository`, adaptadores implementan puertos). No obstante, `application/presentation` importaban clases concretas de infraestructura para construir dependencias, rompiendo parcialmente la inversión de dependencias. La introducción de factorías reduce acoplamiento y prepara el terreno para un contenedor DI real.
- Los controladores crean casos de uso directamente: es funcional, pero se puede mejorar con **composición en la capa de infraestructura** (p. ej. factories de `AuthController`/`UserController`) para cumplir estrictamente con Clean Architecture.

## Flujo de autenticación (Access + Refresh Token)

- `LogInUserUseCase` genera **access token** de 15 minutos y **refresh token** de 7 días usando el servicio de seguridad, y retorna ambos al controlador.
- `AuthController.logInUser` expone el access token en el cuerpo y persiste el refresh token en cookie `refresh_token` con `httpOnly`, `sameSite=strict` y `secure` condicionado por entorno. Falta endpoint de rotación/refresh y almacenamiento server-side de refresh tokens para revocación.

## Evaluación de seguridad

- Hashing de contraseñas con Scrypt (clave de 64 bytes y salt aleatorio) provee protección adecuada.
- JWT firmado con secreto de entorno y expiración configurable; se registran logs en firma/verificación.
- Las cookies de refresh token están marcadas como HttpOnly y SameSite; se recomienda agregar flag `secure` configurable (ya condicionado por `NODE_ENV`) y uso de `path` específico.
- No hay control de scopes/roles ni validación de múltiples sesiones; sería necesario para módulos de equipos/proyectos.

## Middleware de autenticación y permisos

- `authMiddleware` valida formato Bearer y rechaza faltantes. No diferencia errores (expirado vs inválido) y responde 401 genérico; podría delegar a manejador centralizado y enriquecer el contexto con roles/permisos cuando existan.
- No se encontraron middlewares de autorización por roles/equipos; deberán añadirse cuando el dominio incluya permisos.

## Patrón de inyección de dependencias y factorías

- Problema detectado: instanciación de adaptadores/servicios en **rutas y middlewares**, provocando múltiples instancias por request y rompiendo la inversión de dependencias.
- Solución implementada: factorías singleton en infraestructura y consumo desde presentation/middlewares. Ejemplos:
  - `securityServiceFactory` compone `ScryptSecurityAdapter` + `JWTAdapter` una sola vez.
  - `userRepositoryFactory` crea datasource y repositorio de usuarios y los reutiliza.
  - `emailServiceFactory` encapsula `NodemailerAdapter`.
- Beneficio: evita fugas de memoria y garantiza estado consistente de configuraciones (logger, conexión SMTP, claves JWT).

## Olores de código y riesgos detectados

- **Instanciación repetida** de adaptadores/servicios en rutas y middleware (corregido con factorías).
- **Controladores con lógica de composición**: crean casos de uso en cada request; podría delegarse a factorías para facilitar pruebas y mantener controladores delgados.
- **Ausencia de refresh token rotation** y persistencia: no hay lista blanca/negra ni endpoint `/refresh`.
- **Validaciones parciales**: `authMiddleware` no registra contexto de error y los casos de uso confían en validación previa del controlador; centralizar validaciones en dominio evitaría inconsistencias.
- **Falta de middlewares de autorización** para roles/equipos/proyectos (pendiente según roadmap).

## Correcciones aplicadas: instancias únicas

### Antes (problema)

```ts
// En rutas y middleware se creaban servicios por request
const securityAdapter = new ScryptSecurityAdapter();
const tokenAdapter = new JWTAdapter();
const securityService = new SecurityService(securityAdapter, tokenAdapter);
```

### Después (factorías singleton)

- `authMiddleware` ahora importa una instancia compartida en lugar de crearla:

```ts
import { securityService } from "@src/infrastructure/factories/securityServiceFactory";
```

- `authRoutes` y `userRoutes` reutilizan `securityService`, `userRepository` y `emailService` creados en factorías.

## Propuesta de arquitectura con DI/Factories

- **Ejemplo `securityServiceFactory`**: crea adaptadores una sola vez y exporta instancia reutilizable.
- **Ejemplo `userRepositoryFactory`**: construye datasource + repositorio y los comparte.
- **Inicialización única de adaptadores**: JWT/Nodemailer se configuran con `envs` al cargar la factoría.
- **Exposición como singleton**: las factorías exportan constantes (no funciones) para asegurar una única instancia por proceso.
- **Uso en use cases**: los controladores reciben servicios ya construidos y los reusan para cada ejecución de caso de uso, sin recrear adaptadores.
- **Evitar instanciación en middlewares**: se importan dependencias desde factorías, manteniendo los middlewares puros y ligeros.

## Recomendaciones adicionales de arquitectura

- Introducir un **contenedor DI** ligero (ej. Awilix, TSyringe) o factorías por módulo (`AuthModule`, `UserModule`) para instanciar controladores y casos de uso fuera de la capa de presentación.
- Incorporar **casos de uso de refresh/logout** con persistencia y rotación de refresh tokens.
- Añadir **middleware de autorización** por roles/equipos y test unitarios para cada caso de uso.
- Mover la **composición de casos de uso** a la infraestructura/presentation bootstrap (rutas), de modo que los controladores reciban dependencias inyectadas en el constructor una sola vez.
- Centralizar **manejo de errores y logs** con middleware de error global que traduzca excepciones de dominio/infrastructura a códigos HTTP consistentes.
- Separar DTOs de request/respuesta en la capa de aplicación para mantener la pureza del dominio y mejorar la validación.

## Pasos sugeridos para afianzar la DI

1. Crear factorías por módulo (`authFactory`, `userFactory`) que construyan controladores y casos de uso con dependencias únicas.
2. Reexportar instancias desde un **root container** (p. ej. `src/infrastructure/container.ts`) para centralizar el wiring.
3. Sustituir en rutas y middlewares cualquier `new` de adaptadores/servicios por importaciones desde factorías.
4. Añadir pruebas unitarias que mockeen puertos (`IUserRepository`, `ISecurityAdapter`) para validar independencia de infraestructura.
5. Evaluar introducción de un middleware de error que utilice los errores de dominio (`DomainError`, `InvalidTokenError`, etc.) para respuestas coherentes.

## Ejemplo de arquitectura ideal

```
src/
  config/
  domain/
    entities/
    repositories/
    services/
    dtos/
  application/
    usecases/
    middlewares/
  infrastructure/
    adapters/
    services/
    repositories/
    datasources/
    factories/
      securityServiceFactory.ts
      emailServiceFactory.ts
      userRepositoryFactory.ts
      authModuleFactory.ts   // construye controladores + use cases
  presentation/
    controllers/
    routes/
    server.ts
```

- `authModuleFactory` inyecta `securityService`, `userRepository` y `emailService` en `AuthController` y casos de uso.
- Middlewares y rutas solo consumen instancias provistas por factorías/contenedor.

## Conclusión

El proyecto posee una base sólida alineada con Clean Architecture y DDD, pero requería **centralizar la creación de dependencias** para evitar instancias redundantes. Con la introducción de factorías singleton, se estabiliza el consumo de adaptadores/servicios y se prepara el terreno para un contenedor DI formal. Se recomienda avanzar con módulos/factorías por contexto, agregar rotación de refresh tokens y reforzar middlewares de autorización y manejo de errores para consolidar la arquitectura.
