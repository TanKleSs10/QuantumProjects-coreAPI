import { Router } from "express";
import { ProjectController } from "./projectController";
import { logger } from "@src/infrastructure/logs";
import { projectRepository } from "@src/infrastructure/factories/projectRepositoryFactory";
import { teamRepository } from "@src/infrastructure/factories/teamRepositoryFactory";
import { authMiddleware } from "@src/application/middlewares/authmiddleware";
import { validateObjectIdParam } from "@src/application/middlewares/validateObjectId";
import { asyncHandler } from "@src/presentation/middlewares/asyncHandler";

export class ProjectRoutes {
  static get routes() {
    const router = Router();
    const controller = new ProjectController(
      projectRepository,
      teamRepository,
      logger.child("ProjectController"),
    );

    router.use(authMiddleware);

    router.post("/", asyncHandler(controller.createProject));
    router.get(
      "/:id",
      validateObjectIdParam("id"),
      asyncHandler(controller.getProjectById),
    );
    router.put(
      "/:id",
      validateObjectIdParam("id"),
      asyncHandler(controller.updateProject),
    );
    router.patch(
      "/:id",
      validateObjectIdParam("id"),
      asyncHandler(controller.patchProject),
    );
    router.patch(
      "/:id/pause",
      validateObjectIdParam("id"),
      asyncHandler(controller.pauseProject),
    );
    router.patch(
      "/:id/resume",
      validateObjectIdParam("id"),
      asyncHandler(controller.resumeProject),
    );
    router.patch(
      "/:id/complete",
      validateObjectIdParam("id"),
      asyncHandler(controller.completeProject),
    );
    router.patch(
      "/:id/archive",
      validateObjectIdParam("id"),
      asyncHandler(controller.archiveProject),
    );
    router.patch(
      "/:id/unarchive",
      validateObjectIdParam("id"),
      asyncHandler(controller.unarchiveProject),
    );
    router.delete(
      "/:id",
      validateObjectIdParam("id"),
      asyncHandler(controller.deleteProject),
    );

    return router;
  }

  static get userRoutes() {
    const router = Router();
    const controller = new ProjectController(
      projectRepository,
      teamRepository,
      logger.child("ProjectController"),
    );

    router.use(authMiddleware);

    router.get("/", asyncHandler(controller.listProjectsByUser));

    return router;
  }

  static get teamRoutes() {
    const router = Router({ mergeParams: true });
    const controller = new ProjectController(
      projectRepository,
      teamRepository,
      logger.child("ProjectController"),
    );

    router.use(authMiddleware);

    router.use(validateObjectIdParam("teamId"));
    router.get("/", asyncHandler(controller.listProjectsByTeam));

    return router;
  }
}
