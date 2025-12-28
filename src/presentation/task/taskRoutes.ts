import { Router } from "express";
import { TaskController } from "./taskController";
import { authMiddleware } from "@src/application/middlewares/authmiddleware";
import { eventBus } from "@src/infrastructure/factories/eventBusFactory";
import { projectRepository } from "@src/infrastructure/factories/projectRepositoryFactory";
import { taskRepository } from "@src/infrastructure/factories/taskRepositoryFactory";
import { teamRepository } from "@src/infrastructure/factories/teamRepositoryFactory";
import { logger } from "@src/infrastructure/logs";

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

    router.get("/:taskId", controller.getTaskById);
    router.patch("/:taskId", controller.updateTask);
    router.patch("/:taskId/status", controller.changeTaskStatus);
    router.patch("/:taskId/assign", controller.assignTask);

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

    router.post("/", controller.createTask);
    router.get("/", controller.listTasksByProject);

    return router;
  }
}
