import { Router } from "express";
import { UserController } from "./userController";
import { logger } from "@src/infrastructure/logs";
import { securityService } from "@src/infrastructure/factories/securityServiceFactory";
import { userRepository } from "@src/infrastructure/factories/userRepositoryFactory";
import { emailService } from "@src/infrastructure/factories/emailServiceFactory";

export class UserRoutes {
  static get routes() {
    const router = Router();
    const controller = new UserController(
      userRepository,
      securityService,
      emailService,
      logger.child("UserController"),
    );

    // Create
    router.post("/", controller.createUser);

    // Read
    router.get("/", controller.getAllUsers);
    router.get("/:id", controller.getUserById);
    router.get("/email/:email", controller.getUserByEmail);

    // Update
    router.put("/:id", controller.updateUser);

    //Delete
    router.delete("/:id", controller.deleteUser);

    return router;
  }
}
