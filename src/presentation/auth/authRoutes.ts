import { Router } from "express";

import { AuthController } from "./authController";
import { logger } from "@src/infrastructure/logs";
import { securityService } from "@src/infrastructure/factories/securityServiceFactory";
import { userRepository } from "@src/infrastructure/factories/userRepositoryFactory";

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const controller = new AuthController(
      securityService,
      userRepository,
      logger.child("AuthController"),
    );

    router.get("/verify-email/:token", controller.verifyEmail);
    router.post("/reset-password", controller.resetPassword);
    router.post("/login", controller.logInUser);
    router.post("/refresh", controller.refreshToken);
    router.post("/logout", controller.logOutUser);
    return router;
  }
}
