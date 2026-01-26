import { Router } from "express";
import { TeamController } from "./teamController";
import { logger } from "@src/infrastructure/logs";
import { teamRepository } from "@src/infrastructure/factories/teamRepositoryFactory";
import { userRepository } from "@src/infrastructure/factories/userRepositoryFactory";
import { authMiddleware } from "@src/application/middlewares/authmiddleware";
import { validateObjectIdParam } from "@src/application/middlewares/validateObjectId";
import { asyncHandler } from "@src/presentation/middlewares/asyncHandler";

export class TeamRoutes {
  static get routes() {
    const router = Router();
    const controller = new TeamController(
      teamRepository,
      userRepository,
      logger.child("TeamController"),
    );

    router.use(authMiddleware);

    router.post("/", asyncHandler(controller.createTeam));
    router.get("/", asyncHandler(controller.listTeamsByUser));
    router.get(
      "/:id",
      validateObjectIdParam("id"),
      asyncHandler(controller.getTeamById),
    );
    router.post(
      "/:id/members",
      validateObjectIdParam("id"),
      asyncHandler(controller.addMember),
    );
    router.delete(
      "/:id/members/:userId",
      validateObjectIdParam("id"),
      asyncHandler(controller.removeMember),
    );
    router.patch(
      "/:id/members/:userId/promote",
      validateObjectIdParam("id"),
      asyncHandler(controller.promoteMember),
    );
    router.patch(
      "/:id/members/:userId/demote",
      validateObjectIdParam("id"),
      asyncHandler(controller.demoteMember),
    );

    return router;
  }
}
