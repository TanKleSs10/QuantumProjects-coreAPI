import { Router } from "express";
import { UserRoutes } from "./user/userRoutes";
import { AuthRoutes } from "./auth/authRoutes";
import { TeamRoutes } from "./team/teamRoutes";

export class AppRoutes {
  static get router() {
    const router = Router();

    router.use("/users/me", UserRoutes.routes);

    router.use("/auth", AuthRoutes.routes);
    router.use("/teams", TeamRoutes.routes);
    router.get("/welcome", (_req, res) => {
      res.send("Welcome to the Quantum Projects API!");
    });

    return router;
  }
}
