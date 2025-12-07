# Documentación de Errores Personalizados

Este documento detalla la jerarquía de errores personalizados utilizados en el backend de Core API. El sistema de errores está diseñado siguiendo los principios de la arquitectura limpia (Clean Architecture), con tipos de error específicos para cada capa: Dominio, Aplicación e Infraestructura.

## Jerarquía de Errores

La clase base para todos los errores es `BaseError`, que extiende la clase nativa `Error` de JavaScript para incluir metadatos adicionales como un `timestamp` y la `causa` original del error.

---

### `BaseError`

- **Descripción**: Es la clase abstracta fundamental de la que heredan todos los demás errores personalizados en la aplicación. No debe ser instanciada directamente.
- **Causa**: Sirve como un contrato común para el manejo de errores en todas las capas.
- **Solución**: No se maneja directamente. En su lugar, se capturan y gestionan sus clases derivadas más específicas.

---

### `DomainError`

- **Descripción**: Representa una violación de las reglas de negocio, invariantes o la lógica del dominio.
- **Causa**: Ocurre cuando una operación atenta contra una regla de negocio fundamental. Por ejemplo, intentar crear una entidad con datos que la dejarían en un estado inválido (ej: un email con formato incorrecto en un `User`), o realizar una acción no permitida por el estado actual de una entidad (ej: archivar un proyecto que ya está archivado).
- **Posible Solución**:
  1. **Validación de Entrada**: Asegurarse de que los datos enviados a los casos de uso y, consecuentemente, a las entidades de dominio, sean válidos antes de la operación.
  2. **Corrección de Lógica**: Revisar la lógica del caso de uso que precede a la llamada al dominio para evitar estados inconsistentes.
  3. **Depuración**: Analizar el `message` del error para entender qué regla específica se ha roto.

---

### `ApplicationError`

- **Descripción**: Representa un fallo en la capa de aplicación, específicamente dentro de un caso de uso.
- **Causa**: Se lanza cuando la orquestación de un flujo de trabajo no puede completarse por razones que no son ni una violación de dominio puro ni un fallo de infraestructura. Ejemplos comunes incluyen: un usuario que no tiene permisos para realizar una acción, o no se encuentra un recurso necesario para completar el caso de uso.
- **Posible Solución**:
  1. **Verificación de Permisos**: Comprobar que el usuario autenticado tiene los roles o permisos necesarios.
  2. **Comprobación de Existencia**: Verificar que los recursos (ej: `User`, `Project`) existen antes de intentar operar sobre ellos.
  3. **Lógica de Orquestación**: Revisar la secuencia de pasos en el caso de uso para identificar por qué el flujo no puede continuar.

---

### `InfrastructureError`

- **Descripción**: Representa un fallo en la capa de infraestructura, relacionado con sistemas externos, configuración o comunicación.
- **Causa**: Problemas de comunicación con la base de datos, fallo de un servicio externo (como un API de terceros), errores de configuración (ej: variables de entorno faltantes o incorrectas), o problemas con el sistema de archivos.
- **Posible Solución**:
  1. **Revisar Configuración**: Verificar que las variables de entorno (`.env`), credenciales y puntos de conexión son correctos.
  2. **Estado de Servicios Externos**: Comprobar que la base de datos, el servidor de email y otros servicios externos estén operativos.
  3. **Logs**: Analizar los logs de la infraestructura para obtener detalles sobre el fallo (ej: error de conexión a la base de datos, timeout).

---

### `RepositoryError`

- **Descripción**: Un tipo específico de `InfrastructureError` que ocurre dentro de las implementaciones de los repositorios.
- **Causa**: Indica que el repositorio no pudo cumplir con su contrato de acceso a datos. Esto puede deberse a un error al ejecutar una consulta en la base de datos, un problema al mapear los datos del modelo de base de datos a la entidad de dominio, o una respuesta inesperada del `DataSource`.
- **Posible Solución**:
  1. **Depurar Consultas**: Revisar la consulta a la base de datos que falló. Puede haber un error de sintaxis o un problema con los datos pasados.
  2. **Mapeo de Datos**: Asegurarse de que el mapeo entre el modelo de la base de datos (ej: `UserModel`) y la entidad de dominio (ej: `User`) es correcto y maneja todos los campos esperados.
  3. **Consistencia de Datos**: Verificar que los datos en la base de datos son consistentes y no hay registros corruptos que puedan causar fallos de lectura.

---

### `EmailSendingError`

- **Descripción**: Un `InfrastructureError` específico que indica un fallo al intentar enviar un correo electrónico.
- **Causa**: El servicio de envío de correo (ej: Nodemailer) no pudo completar el envío. Esto puede ser por credenciales SMTP incorrectas, un problema de conexión con el servidor de correo, o que el servicio esté caído.
- **Posible Solución**:
  1. **Verificar Credenciales**: Asegurarse de que las credenciales del servidor de correo en las variables de entorno son correctas.
  2. **Probar Conexión**: Realizar una prueba de conexión simple al servidor SMTP para descartar problemas de red o firewall.
  3. **Logs del Servicio de Correo**: Revisar los logs del proveedor de correo para obtener más detalles sobre el fallo.

---

### `EmailTemplateError`

- **Descripción**: Un `InfrastructureError` que ocurre al intentar renderizar una plantilla de correo electrónico.
- **Causa**: La plantilla HTML no se pudo encontrar en la ruta especificada, o contiene errores de sintaxis que impiden su renderizado.
- **Posible Solución**:
  1. **Verificar Ruta**: Comprobar que la ruta al archivo de la plantilla (`.html`) es correcta.
  2. **Sintaxis de la Plantilla**: Revisar el contenido de la plantilla para asegurarse de que las variables y la estructura son correctas para el motor de plantillas que se esté utilizando.

---

### `InvalidTokenError`

- **Descripción**: Un `InfrastructureError` que indica que un token (generalmente JWT) es inválido.
- **Causa**: El token proporcionado está malformado, tiene una firma incorrecta o ha sido manipulado.
- **Posible Solución**:
  1. **Re-autenticación**: El usuario debe volver a iniciar sesión para obtener un nuevo token válido.
  2. **Depuración del Token**: Durante el desarrollo, verificar que el token se está generando y firmando correctamente con la clave secreta (`JWT_SECRET`) adecuada.

---

### `ExpiredTokenError`

- **Descripción**: Un `InfrastructureError` que indica que un token, aunque válido, ha expirado.
- **Causa**: La fecha de expiración del token es anterior a la fecha y hora actuales.
- **Posible Solución**:
  1. **Refrescar Token**: Si la aplicación implementa un sistema de "refresh tokens", utilizarlo para obtener un nuevo token de acceso sin que el usuario tenga que volver a iniciar sesión.
  2. **Re-autenticación**: Si no hay un sistema de refresco, el usuario debe volver a iniciar sesión.

---

### `HttpError`

- **Descripción**: Un error diseñado para ser utilizado en la capa de presentación (controladores) para encapsular un mensaje de error con un código de estado HTTP.
- **Causa**: Se utiliza para detener el flujo de una petición y enviar una respuesta de error HTTP estandarizada al cliente. Generalmente, se crea a partir de la captura de otros errores de capas inferiores (`DomainError`, `ApplicationError`, etc.).
- **Posible Solución**: Este error es parte del flujo normal de manejo de errores de la API. La solución no es "arreglar" el `HttpError`, sino el error subyacente que lo causó. El `HttpError` asegura que el cliente reciba una respuesta adecuada (ej: 400, 404, 500).
