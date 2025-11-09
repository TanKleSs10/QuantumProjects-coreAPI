import { Router } from "express";
import { UserRoutes } from "./user/userRoutes";

export class AppRoutes {
  static get router() {
    const router = Router();

    router.use("/users", UserRoutes.routes);
    router.get("/welcome", (_req, res) => {
      res.send("Welcome to the Quantum Projects API!");
    });

    return router;
  }
}
