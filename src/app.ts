import { envs } from "./config/envs";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";

(async () => {
  main();
})();

function main(): void {
  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.router,
  });

  server.start();
}
