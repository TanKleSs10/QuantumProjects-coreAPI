import { Router } from "express";

import { AuthController } from "./authController";
import { logger } from "@src/infrastructure/logs";
import { securityService } from "@src/infrastructure/factories/securityServiceFactory";
import { userRepository } from "@src/infrastructure/factories/userRepositoryFactory";
import { emailService } from "@src/infrastructure/factories/emailServiceFactory";

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const controller = new AuthController(
      securityService,
      userRepository,
      emailService,
      logger.child("AuthController"),
    );

    router.post("/signup", controller.signUpUser);
    router.get("/verify-email/:token", controller.verifyEmail);
    router.post("/login", controller.logInUser);
    router.post("/reset-password", controller.resetPassword);
    router.post("/refresh", controller.refreshToken);
    router.post("/logout", controller.logOutUser);
    return router;
  }
}
