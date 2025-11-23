import { Router } from "express";

import { AuthController } from "./authController";
import { logger } from "@src/infrastructure/logs";
import { SecurityService } from "@src/infrastructure/services/SecurityService";
import { ScryptSecurityAdapter } from "@src/infrastructure/adapters/ScryptSecurityAdapter";
import { JWTAdapter } from "@src/infrastructure/adapters/JWTAdapter";
import { UserRepository } from "@src/infrastructure/repositories/UserRepository";
import { UserDatasource } from "@src/infrastructure/datasources/UserDatasource";

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const securityAdapter = new ScryptSecurityAdapter();
    const tokenAdapter = new JWTAdapter();
    const securityService = new SecurityService(securityAdapter, tokenAdapter);
    const datasource = new UserDatasource();
    const repository = new UserRepository(datasource);
    const controller = new AuthController(
      securityService,
      repository,
      logger.child("AuthController"),
    );

    router.get("/verify-email/:token", controller.verifyEmail);
    router.post("/reset-password", controller.resetPassword);
    router.post("/login", controller.logInUser);
    return router;
  }
}
