import { Router } from "express";
import { TeamController } from "./teamController";
import { logger } from "@src/infrastructure/logs";
import { teamRepository } from "@src/infrastructure/factories/teamRepositoryFactory";
import { authMiddleware } from "@src/application/middlewares/authmiddleware";

export class TeamRoutes {
  static get routes() {
    const router = Router();
    const controller = new TeamController(
      teamRepository,
      logger.child("TeamController"),
    );

    router.use(authMiddleware);

    router.post("/", controller.createTeam);
    router.get("/", controller.listTeamsByUser);
    router.get("/:id", controller.getTeamById);
    router.post("/:id/members", controller.addMember);
    router.delete("/:id/members/:userId", controller.removeMember);
    router.patch("/:id/members/:userId/promote", controller.promoteMember);
    router.patch("/:id/members/:userId/demote", controller.demoteMember);

    return router;
  }
}
