import { Router } from "express";

export class AppRoutes {
  static get router() {
    const router = Router();

    router.get("/welcome", (_req, res) => {
      res.send("Welcome to the Quantum Projects API!");
    });

    return router;
  }
}
