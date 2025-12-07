# Análisis de Arquitectura y Testeabilidad del Proyecto

## 1. Diagnóstico del Problema

Tras intentar configurar las pruebas, hemos encontrado un obstáculo fundamental que impide testear la aplicación de forma aislada. El problema no reside en las herramientas de testing (Vitest, Supertest), sino en un **alto acoplamiento en la arquitectura de la aplicación**.

El síntoma principal es que es imposible importar un módulo de la capa de presentación (como `authRoutes`) sin cargar y ejecutar código de la capa de infraestructura (modelos de base de datos de Typegoose). Esto provoca errores de dependencias circulares y de inicialización que los mocks de Vitest no pueden resolver fácilmente, ya que el código se ejecuta en el momento de la importación.

## 2. Antipatrones Identificados

La causa raíz de este problema se debe a varios antipatrones presentes en el código:

### Antipatrón 1: Inyección de Dependencias Manual y Estática

El problema más grave se encuentra en los archivos de rutas, como `src/presentation/auth/authRoutes.ts`.

```typescript
// src/presentation/auth/authRoutes.ts

import { Router } from "express";
import { AuthController } from "./authController";
import { logger } from "@src/infrastructure/logs";
// ¡Alerta! Se importan implementaciones concretas de las factorías.
import { securityService } from "@src/infrastructure/factories/securityServiceFactory";
import { userRepository } from "@src/infrastructure/factories/userRepositoryFactory";

export class AuthRoutes {
  static get routes() {
    const router = Router();

    // ¡Alerta! El router crea su propia dependencia (el controlador).
    const controller = new AuthController(
      securityService, // Se usa la instancia real.
      userRepository, // Se usa la instancia real.
      logger.child("AuthController"),
    );

    router.post("/login", controller.logInUser);
    // ...
    return router;
  }
}
```

- **Problema:** La clase `AuthRoutes` **crea sus propias dependencias**. Importa directamente las factorías (`securityService`, `userRepository`) y las usa para instanciar `AuthController`. Esto acopla fuertemente la capa de rutas con la capa de infraestructura. No hay forma de "interceptar" esta creación en un test para proporcionar mocks.

### Antipatrón 2: Factorías como Singletons Implícitos

Los archivos de factorías (`userRepositoryFactory.ts`, etc.) exportan instancias ya creadas.

```typescript
// src/infrastructure/factories/userRepositoryFactory.ts
import { UserRepository } from "../repositories/UserRepository";
// ... otras importaciones

// ¡Alerta! Se exporta una instancia, no una clase o una función factory.
export const userRepository = new UserRepository(/*...*/);
```

- **Problema:** Esto convierte a `userRepository` en un singleton de facto. Cualquier archivo que lo importe recibirá la misma instancia, haciendo imposible sustituirla en un entorno de pruebas sin usar técnicas de mocking a nivel de módulo, que como hemos visto, son frágiles y complejas cuando hay dependencias circulares.

### Antipatrón 3: Efectos Secundarios en la Carga de Módulos

El simple hecho de importar un módulo (`import ...`) desencadena una cadena de eventos que llega hasta la inicialización de los modelos de Typegoose, que a su vez dependen de `reflect-metadata`. Este es el origen del error `Type is: "undefined"`.

- **Problema:** Los módulos no deberían tener efectos secundarios tan significativos al ser importados. La inicialización de la base de datos y la creación de instancias de servicios deberían ocurrir en un único lugar controlado: el punto de entrada de la aplicación.

## 3. Solución Propuesta: Inversión de Dependencias (DI)

La solución a estos problemas es aplicar el **Principio de Inversión de Dependencias (DIP)**. En lugar de que los módulos de alto nivel (rutas) dependan de los de bajo nivel (infraestructura), ambos deben depender de abstracciones (interfaces).

Proponemos refactorizar el código para usar **Inyección de Dependencias**, donde las dependencias de una clase se le "inyectan" desde fuera, en lugar de que la clase las cree por sí misma.

### Plan de Refactorización

#### Paso 1: Centralizar la Creación de Dependencias (Contenedor de DI)

Crearemos un "contenedor" simple que se encargue de construir y proporcionar todas las dependencias. Esto se puede hacer con una librería como `tsyringe` o `InversifyJS`, pero para empezar, un simple objeto es suficiente.

#### Paso 2: Refactorizar las Rutas para que Acepten Dependencias

Las rutas no deben crear controladores. Deben ser funciones que reciben un controlador ya instanciado.

**Antes:**

```typescript
// src/presentation/auth/authRoutes.ts
export class AuthRoutes {
  static get routes() {
    const router = Router();
    const controller = new AuthController(...); // Creación interna
    router.post("/login", controller.logInUser);
    return router;
  }
}
```

**Después:**

```typescript
// src/presentation/auth/authRouter.ts (nuevo archivo o refactor)
import { Router } from "express";
import { AuthController } from "./authController";

// La función ahora RECIBE el controlador
export const createAuthRouter = (controller: AuthController): Router => {
  const router = Router();
  router.post("/login", controller.logInUser);
  // ...
  return router;
};
```

#### Paso 3: Ensamblar la Aplicación en el Punto de Entrada (`app.ts`)

El archivo principal `app.ts` se convierte en el "compositor" de la aplicación. Aquí es donde se usaría el contenedor de DI para construir todo y conectar las piezas.

```typescript
// En app.ts (versión simplificada)
import { AuthController } from './presentation/auth/authController';
import { createAuthRouter } from './presentation/auth/authRouter';
// ... importaciones de servicios y repositorios REALES

// 1. Crear instancias (composición de objetos)
const userRepository = new UserRepository(...);
const securityService = new SecurityService(...);
const authController = new AuthController(securityService, userRepository, logger);

// 2. Inyectar dependencias
const authRouter = createAuthRouter(authController);
const app = express();
app.use('/api/auth', authRouter);

// ... iniciar servidor
```

### ¿Cómo Facilita Esto las Pruebas?

Con esta nueva estructura, un test se vuelve trivialmente simple. No necesitas mocks de módulo complejos.

```typescript
// src/presentation/auth/auth.test.ts (¡NUEVO Y MEJORADO!)
import request from "supertest";
import express from "express";
import { AuthController } from "./authController";
import { createAuthRouter } from "./authRouter";

// 1. Crea tus mocks (simples objetos de jest/vitest)
const mockUserRepository = { findByEmail: vi.fn() };
const mockSecurityService = {
  comparePassword: vi.fn(),
  generateToken: vi.fn(),
};

// 2. Crea la instancia del controlador con los mocks
const testAuthController = new AuthController(
  mockUserRepository as any,
  mockSecurityService as any,
  mockLogger as any,
);

// 3. Inyecta el controlador de prueba en el router
const testRouter = createAuthRouter(testAuthController);
const app = express();
app.use(express.json());
app.use("/api/auth", testRouter);

describe("POST /api/auth/login", () => {
  it("should return 200 and a token on success", async () => {
    // Arrange: Configura el comportamiento de los mocks
    mockUserRepository.findByEmail.mockResolvedValue({
      password: "hashed_password",
    });
    mockSecurityService.comparePassword.mockResolvedValue(true);
    mockSecurityService.generateToken.mockResolvedValue("fake_token");

    // Act
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com", password: "password" });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.token).toBe("fake_token");
  });
});
```

**Ventajas de este enfoque:**

- **Cero acoplamiento:** El test no sabe nada de la base de datos ni de la infraestructura real.
- **Claridad:** El test es fácil de leer y entender. Se ve claramente qué dependencias se están usando.
- **Rapidez:** Las pruebas se ejecutan en milisegundos porque no hay I/O de red o disco.
- **Robustez:** Los cambios en la infraestructura no romperán los tests de la capa de presentación.

## 4. Conclusión

La dificultad para testear tu proyecto es una señal valiosa que indica la necesidad de un refactor arquitectónico. Adoptar el principio de **Inyección de Dependencias** desacoplará tus componentes, haciendo que tu aplicación no solo sea más fácil de testear, sino también más mantenible, escalable y robusta a largo plazo.
