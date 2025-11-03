import { Router } from "express";
import { UserController } from "./userController";
import { logger } from "@src/infrastructure/logs";
import { SecurityService } from "@src/infrastructure/services/SecurityService";
import { ScryptSecurityAdapter } from "@src/infrastructure/adapters/ScryptSecurityAdapter";
import { UserRepository } from "@src/infrastructure/repositories/UserRepository";
import { UserDatasource } from "@src/infrastructure/datasources/UserDatasource";
import { JwtAdapter } from "@src/infrastructure/adapters/JwtAdapter";
import { NodemailerAdapter } from "@src/infrastructure/adapters/NodemailerAdapter";
import { EmailService } from "@src/infrastructure/services/EmailService";

export class UserRoutes {
  static get routes() {
    const router = Router();
    const securityAdapter = new ScryptSecurityAdapter();
    const jwtAdapter = new JwtAdapter();
    const securityService = new SecurityService(securityAdapter, jwtAdapter);
    const mailAdapter = new NodemailerAdapter();
    const emailService = new EmailService(mailAdapter);
    const datasource = new UserDatasource();
    const repository = new UserRepository(datasource);
    const controller = new UserController(
      repository,
      securityService,
      emailService,
      logger.child("UserController"),
    );

    router.post("/", controller.createUser);

    return router;
  }
}
