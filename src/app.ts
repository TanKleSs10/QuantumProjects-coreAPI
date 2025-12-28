import "dotenv/config";
import "reflect-metadata";
import "./types/express";
import { logger } from "./infrastructure/logs";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";
import { envs } from "./config/envs";
import { MongoConfig } from "./infrastructure/database/mongo/config";

const startServer = async () => {
  const database = new MongoConfig({
    mongoUri: envs.URI_DB,
    logger: logger.child("MongoConfig"),
  });
  await database.connect();
};

const server = new Server({
  port: envs.PORT,
  routes: AppRoutes.router,
  Logger: logger.child("Server"),
});

if (process.env.NODE_ENV !== "test") {
  startServer()
    .then(() => server.start())
    .catch((error) => {
      logger.error("Failed to start server", {
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    });
}

// Export the app for testing
export const app = server.app;
