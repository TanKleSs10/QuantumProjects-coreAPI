# Quantum Projects API

Clean Architecture skeleton for the Quantum Projects platform. The focus is on clarity, modularity, and providing a solid foundation for future features.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and adjust values as needed:

   ```bash
   cp .env.example .env
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The API exposes a health check at `GET /api/health` once the server is running.

## Project Structure

The source code follows a simplified Clean Architecture layout:

```
src/
├── app/            # HTTP adapters: routes, controllers, middlewares
├── core/           # Domain entities, DTOs, use cases, and interfaces
├── infrastructure/ # Implementations for persistence, services, logging
├── shared/         # Cross-cutting concerns (errors, constants, utils)
└── main.ts         # Application bootstrap entry point
```

## Testing

Run the test suite with:

```bash
npm test
```

Tests currently include placeholders ready to be expanded with real coverage.
