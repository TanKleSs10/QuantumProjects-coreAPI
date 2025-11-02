# Quantum Projects Context

Quantum Projects is an internal project management platform for Quantum MD. The backend follows a modular Clean Architecture with Domain-Driven Design principles:

- **App Layer** exposes HTTP adapters (routes, controllers, middlewares) using Express.
- **Core Layer** contains domain entities, DTOs, interfaces, use cases, and domain events.
- **Infrastructure Layer** provides technical implementations (database, repositories, services, logging).
- **Shared Layer** hosts cross-cutting concerns like errors, constants, and utilities.

The codebase is written in TypeScript and targets Node.js, using MongoDB with Mongoose as the ODM.
