import { Router } from "express";
import { UserController } from "./userController";
import { logger } from "@src/infrastructure/logs";
import { SecurityService } from "@src/infrastructure/services/SecurityService";
import { ScryptSecurityAdapter } from "@src/infrastructure/adapters/ScryptSecurityAdapter";
import { UserRepository } from "@src/infrastructure/repositories/UserRepository";
import { UserDatasource } from "@src/infrastructure/datasources/UserDatasource";

export class UserRoutes {
  static get routes() {
    const router = Router();
    const securityAdapter = new ScryptSecurityAdapter();
    const securityService = new SecurityService(securityAdapter);
    const datasource = new UserDatasource();
    const repository = new UserRepository(datasource);
    const controller = new UserController(
      repository,
      securityService,
      logger.child("UserController"),
    );

    router.post("/", controller.createUser);

    return router;
  }
}
