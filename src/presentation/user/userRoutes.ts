import { Router } from "express";
import { UserController } from "./userController";
import { logger } from "@src/infrastructure/logs";
import { securityService } from "@src/infrastructure/factories/securityServiceFactory";
import { userRepository } from "@src/infrastructure/factories/userRepositoryFactory";
import { authMiddleware } from "@src/application/middlewares/authmiddleware";
import { asyncHandler } from "@src/presentation/middlewares/asyncHandler";

export class UserRoutes {
  static get routes() {
    const router = Router();
    const controller = new UserController(
      userRepository,
      securityService,
      logger.child("UserController"),
    );

    router.use(authMiddleware);

    // Read
    router.get("/", asyncHandler(controller.getUserById));

    // Update
    router.put("/", asyncHandler(controller.updateUser));

    // Change Password
    router.patch("/change-password", asyncHandler(controller.changePassword));

    //Delete
    router.delete("/", asyncHandler(controller.deleteUser));

    return router;
  }
}
