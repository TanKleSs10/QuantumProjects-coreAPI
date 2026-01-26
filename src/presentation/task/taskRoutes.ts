import { Router } from "express";
import { TaskController } from "./taskController";
import { authMiddleware } from "@src/application/middlewares/authmiddleware";
import { eventBus } from "@src/infrastructure/factories/eventBusFactory";
import { projectRepository } from "@src/infrastructure/factories/projectRepositoryFactory";
import { taskRepository } from "@src/infrastructure/factories/taskRepositoryFactory";
import { teamRepository } from "@src/infrastructure/factories/teamRepositoryFactory";
import { logger } from "@src/infrastructure/logs";
import { validateObjectIdParam } from "@src/application/middlewares/validateObjectId";
import { asyncHandler } from "@src/presentation/middlewares/asyncHandler";

export class TaskRoutes {
  static get routes() {
    const router = Router();
    const controller = new TaskController(
      taskRepository,
      projectRepository,
      teamRepository,
      eventBus,
      logger.child("TaskController"),
    );

    router.use(authMiddleware);

    router.get(
      "/:taskId",
      validateObjectIdParam("taskId"),
      asyncHandler(controller.getTaskById),
    );
    router.patch(
      "/:taskId",
      validateObjectIdParam("taskId"),
      asyncHandler(controller.updateTask),
    );
    router.patch(
      "/:taskId/status",
      validateObjectIdParam("taskId"),
      asyncHandler(controller.changeTaskStatus),
    );
    router.patch(
      "/:taskId/assign",
      validateObjectIdParam("taskId"),
      asyncHandler(controller.assignTask),
    );

    return router;
  }

  static get userRoutes() {
    const router = Router();
    const controller = new TaskController(
      taskRepository,
      projectRepository,
      teamRepository,
      eventBus,
      logger.child("TaskController"),
    );

    router.use(authMiddleware);

    router.get("/", asyncHandler(controller.listTasksByUser));

    return router;
  }

  static get teamRoutes() {
    const router = Router({ mergeParams: true });
    const controller = new TaskController(
      taskRepository,
      projectRepository,
      teamRepository,
      eventBus,
      logger.child("TaskController"),
    );

    router.use(authMiddleware);

    router.use(validateObjectIdParam("teamId"));
    router.get("/", asyncHandler(controller.listTasksByTeam));

    return router;
  }

  static get projectRoutes() {
    const router = Router({ mergeParams: true });
    const controller = new TaskController(
      taskRepository,
      projectRepository,
      teamRepository,
      eventBus,
      logger.child("TaskController"),
    );

    router.use(authMiddleware);

    router.use(validateObjectIdParam("projectId"));
    router.post("/", asyncHandler(controller.createTask));
    router.get("/", asyncHandler(controller.listTasksByProject));

    return router;
  }
}
