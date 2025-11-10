import { Router } from "express";
import { UserRoutes } from "./user/userRoutes";
import { AuthRoutes } from "./auth/authRoutes";

export class AppRoutes {
  static get router() {
    const router = Router();

    router.use("/users", UserRoutes.routes);
    router.use("/auth", AuthRoutes.routes);
    router.get("/welcome", (_req, res) => {
      res.send("Welcome to the Quantum Projects API!");
    });

    return router;
  }
}
