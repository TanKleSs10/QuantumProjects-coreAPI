# Quantum Projects · Core API

## 🧠 Contexto general

Quantum Projects es la plataforma de gestión de proyectos de la marca Quantum MD orientada a equipos técnicos, agencias y freelancers que necesitan coordinar iniciativas de forma colaborativa. Combina prácticas de productividad tipo ClickUp o Trello con un enfoque social y de portafolio profesional inspirado en Behance/LinkedIn.

La etapa actual corresponde al backend interno que soportará la operación de Quantum MD. Desde esta base evolucionará hacia un SaaS colaborativo y visual, preparado para escalar con un modelo freemium rentable.

## ⚙️ Arquitectura y stack

El servicio se construye siguiendo Clean Architecture para mantener las reglas de negocio aisladas de la infraestructura. El stack principal es:

- **Node.js + TypeScript** como runtime y lenguaje principal.
- **Express** para la capa HTTP.
- **Mongoose + Typegoose** para el acceso a MongoDB.
- **Winston** como logger centralizado.
- **Grafana + Loki** para observabilidad y visualización de métricas.
- **Docker Compose** para orquestar los servicios de desarrollo.
- **Nodemailer + plantillas HTML** para notificaciones transaccionales.
- **JWT (jsonwebtoken)** para flujos de verificación y recuperación de acceso.

### Estructura de carpetas

```
src/
├── domain/           # Reglas de negocio puras (en construcción)
├── application/      # Casos de uso y orquestadores (en construcción)
├── infrastructure/   # Integraciones técnicas (DB, logs, drivers)
├── interfaces/       # Contratos compartidos entre capas
└── presentation/     # Entradas/salidas del sistema (HTTP, CLI, etc.)
```

La infraestructura disponible actualmente incluye la configuración del servidor HTTP, la conexión a MongoDB y la capa de logging lista para enviarse a Loki.

## 🧰 Configuración y ejecución

### Requisitos

- Node.js 20+
- Docker + Docker Compose (opcional pero recomendado)

### Variables de entorno mínimas

| Variable              | Descripción                                                   | Ejemplo                                                                 |
| --------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `PORT`                | Puerto expuesto por la API                                    | `4000`                                                                  |
| `NODE_ENV`            | Entorno de ejecución (`development`, `staging`, `production`) | `development`                                                           |
| `MONGODB_URI`         | Cadena de conexión para la base de datos                      | `mongodb://root:pass@localhost:27017/quantum_projects?authSource=admin` |
| `MONGO_DB_NAME`       | Nombre de la base al levantar Mongo con Docker                | `quantum_projects`                                                      |
| `MONGO_ROOT_USER`     | Usuario administrador para Mongo (Docker)                     | `admin`                                                                 |
| `MONGO_ROOT_PASSWORD` | Contraseña del usuario administrador (Docker)                 | `supersecret`                                                           |
| `LOKI_HOST`           | Endpoint HTTP del servicio Loki                               | `http://loki:3100`                                                      |
| `GF_USER`             | Usuario administrador inicial de Grafana                      | `admin`                                                                 |
| `GF_PASS`             | Contraseña del usuario de Grafana                             | `admin`                                                                 |
| `APP_URL`             | URL base pública del backend para componer enlaces de email   | `https://api.quantum.md`                                                |
| `FRONTEND_URL`        | URL del frontend utilizada como fallback para enlaces         | `https://app.quantum.md`                                                |
| `JWT_SECRET`          | Clave privada usada para firmar tokens JWT                    | `super_secret_key`                                                      |
| `JWT_EXPIRES_IN`      | Tiempo de expiración por defecto de los tokens                | `1h`                                                                    |
| `SMTP_HOST`           | Host del proveedor SMTP                                       | `smtp.mailgun.org`                                                      |
| `SMTP_PORT`           | Puerto del servicio SMTP                                      | `587`                                                                   |
| `SMTP_USER`           | Usuario/identidad del remitente SMTP                          | `postmaster@mailgun.org`                                                |
| `SMTP_PASS`           | Contraseña o API key del proveedor SMTP                       | `key-123abc`                                                            |
| `SMTP_SECURE`         | Usa TLS (true/false según el puerto configurado)              | `false`                                                                 |

> Crea un archivo `.env` basado en `.env-template` y completa las variables requeridas.

### Ejecución en modo desarrollo

```bash
npm install
npm run dev
```

El servidor quedará disponible en `http://localhost:<PORT>` y expone actualmente un endpoint de prueba en `/welcome`.

### Ejecución con Docker Compose

```bash
docker compose up --build
```

Servicios incluidos:

- `qp_api`: API de Quantum Projects con hot-reload usando Nodemon.
- `qp_mongo`: MongoDB 7 con credenciales configurables y volumen persistente.
- `loki`: receptor de logs centralizado accesible en `http://localhost:3100`.
- `grafana`: interfaz de observabilidad disponible en `http://localhost:3000` con el usuario y contraseña configurados vía entorno.

## 🔐 Autenticación, verificación y notificaciones

Los flujos de identidad se desacoplan mediante puertos/adaptadores:

- `SecurityService` orquesta hashing con **Scrypt** y tokens firmados por `JWTAdapter`.
- `EmailService` consume `IMailAdapter` (implementado con **Nodemailer**) y renderiza plantillas HTML desde `src/infrastructure/email/templates/` mediante un motor ligero de reemplazo de variables.

### Flujos disponibles

| Caso                           | Descripción                                                                                                         | Endpoint                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Verificación de cuenta         | Tras crear un usuario, se envía un correo con un enlace firmado. El controlador valida el token y activa la cuenta. | `GET /api/auth/verify-email?token=<jwt>` |
| Restablecimiento de contraseña | Permite actualizar la contraseña validando el token enviado por correo.                                             | `POST /api/auth/reset-password`          |
| Notificaciones HTML            | `EmailService.sendNotificationEmail` admite plantillas con variables personalizadas para avisos transaccionales.    | —                                        |

Cada plantilla utiliza variables como `${username}` o `${link}` que son reemplazadas dinámicamente por `templateEngine.ts`. Los HTML se pueden extender o personalizar manteniendo el principio de responsabilidad única.

## 🧩 Observabilidad

La API utiliza Winston como logger principal. En desarrollo los logs se muestran en consola de forma inmediata. En entornos productivos, Winston envía los eventos a Loki en formato JSON para su almacenamiento centralizado.

1. **Colección de logs**: el `WinstonLogger` empaqueta cada mensaje con `scope`, `environment` y `timestamp`. En producción usa el transporte `winston-loki` para enviar los registros en batch, evitando pérdidas y preservando el formato requerido por Loki.
2. **Ingesta en Loki**: Loki recibe los eventos etiquetados por aplicación y entorno. La variable `LOKI_HOST` controla el endpoint del servicio.
3. **Visualización en Grafana**: Grafana se conecta a Loki como datasource (`http://loki:3100`). Desde el panel, consulta las etiquetas (`app`, `environment`, `scope`) para filtrar trazas y construir dashboards KISS con métricas clave como frecuencia de errores, tiempos de respuesta o actividad por módulo.

### Uso rápido del dashboard

- Entra a Grafana (`http://localhost:3000`).
- Configura Loki como datasource apuntando a `http://loki:3100` (si no está preconfigurado).
- Crea una nueva vista con la consulta `{app="quantum-projects-api"}` y aplica filtros adicionales como `{scope="Server"}` para aislar módulos.
- Añade transformaciones simples (count, rate, topk) para visualizar volumen de logs, errores o tendencias por etiqueta.

## 🚀 Próximas etapas

1. **Módulo de proyectos**: modelado de entidades, casos de uso y endpoints CRUD.
2. **Panel visual de tareas**: endpoints y vistas para tableros colaborativos tipo kanban.
3. **Perfiles avanzados y scopes**: integración con identity provider externo, perfiles profesionales y permisos.
4. **Escalado a SaaS freemium**: automatización de onboarding, planes de suscripción y observabilidad multi-tenant.

---

Este documento se actualiza conforme avance el desarrollo para mantener alineado el diseño técnico con la visión de Quantum Projects.
