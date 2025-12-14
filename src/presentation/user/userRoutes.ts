import { Router } from "express";
import { UserController } from "./userController";
import { logger } from "@src/infrastructure/logs";
import { securityService } from "@src/infrastructure/factories/securityServiceFactory";
import { userRepository } from "@src/infrastructure/factories/userRepositoryFactory";

export class UserRoutes {
  static get routes() {
    const router = Router();
    const controller = new UserController(
      userRepository,
      securityService,
      logger.child("UserController"),
    );

    // Read
    router.get("/bin.usr-is-merged/", controller.getUserById);

    // Update
    router.put("/", controller.updateUser);

    // Change Password
    router.patch("/change-password", controller.changePassword);

    //Delete
    router.delete("/", controller.deleteUser);

    return router;
  }
}
