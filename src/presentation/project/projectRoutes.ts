import { Router } from "express";
import { ProjectController } from "./projectController";
import { logger } from "@src/infrastructure/logs";
import { projectRepository } from "@src/infrastructure/factories/projectRepositoryFactory";
import { teamRepository } from "@src/infrastructure/factories/teamRepositoryFactory";
import { authMiddleware } from "@src/application/middlewares/authmiddleware";

export class ProjectRoutes {
  static get routes() {
    const router = Router();
    const controller = new ProjectController(
      projectRepository,
      teamRepository,
      logger.child("ProjectController"),
    );

    router.use(authMiddleware);

    router.post("/", controller.createProject);
    router.get("/", controller.listProjectsByTeam);
    router.get("/:id", controller.getProjectById);
    router.put("/:id", controller.updateProject);
    router.patch("/:id/pause", controller.pauseProject);
    router.patch("/:id/resume", controller.resumeProject);
    router.patch("/:id/complete", controller.completeProject);
    router.patch("/:id/archive", controller.archiveProject);
    router.delete("/:id", controller.deleteProject);

    return router;
  }
}
