import "dotenv/config";
import { logger } from "./infrastructure/logs";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";
import { envs } from "./config/envs";
import { MongoConfig } from "./infrastructure/database/mongo/config";

(async () => {
  main();
})();

function main(): void {
  // Configure and connect to the database
  const database = new MongoConfig({
    mongoUri: envs.URI_DB,
    logger: logger.child("MongoConfig"),
  });

  database.connect();

  // Initialize and start the server
  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.router,
    Logger: logger.child("Server"),
  });

  server.start();
}
