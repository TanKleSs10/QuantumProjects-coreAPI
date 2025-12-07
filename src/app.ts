import "dotenv/config";
import "reflect-metadata";
import { logger } from "./infrastructure/logs";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";
import { envs } from "./config/envs";
import { MongoConfig } from "./infrastructure/database/mongo/config";

// This part will run only in the actual application, not in tests if we mock it.
(async () => {
  const database = new MongoConfig({
    mongoUri: envs.URI_DB,
    logger: logger.child("MongoConfig"),
  });
  await database.connect();
})();

const server = new Server({
  port: envs.PORT,
  routes: AppRoutes.router,
  Logger: logger.child("Server"),
});

// Start the server in the main application
if (process.env.NODE_ENV !== 'test') {
  server.start();
}

// Export the app for testing
export const app = server.app;