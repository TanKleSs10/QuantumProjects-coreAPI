import { Request, Response } from "express";
import { AssignTaskUseCase } from "@src/application/usecases/task/AssignTaskUseCase";
import { ChangeTaskStatusUseCase } from "@src/application/usecases/task/ChangeTaskStatusUseCase";
import { CreateTaskUseCase } from "@src/application/usecases/task/CreateTaskUseCase";
import { GetTaskByIdUseCase } from "@src/application/usecases/task/GetTaskByIdUseCase";
import { ListTasksByProjectUseCase } from "@src/application/usecases/task/ListTasksByProjectUseCase";
import { UpdateTaskUseCase } from "@src/application/usecases/task/UpdateTaskUseCase";
import { AssignTaskSchema } from "@src/domain/dtos/AssignTaskDTO";
import { ChangeTaskStatusSchema } from "@src/domain/dtos/ChangeTaskStatusDTO";
import { CreateTaskSchema } from "@src/domain/dtos/CreateTaskDTO";
import { ListTasksByProjectSchema } from "@src/domain/dtos/ListTasksByProjectDTO";
import { UpdateTaskSchema } from "@src/domain/dtos/UpdateTaskDTO";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { IEventBus } from "@src/domain/services/IEventBus";
import { ILogger } from "@src/interfaces/Logger";
import { DomainError } from "@src/shared/errors/DomainError";
import { HttpError } from "@src/shared/errors/HttpError";

export class TaskController {
  private readonly logger: ILogger;

  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    private readonly eventBus: IEventBus,
    logger: ILogger,
  ) {
    this.logger = logger.child("TaskController");
  }

  createTask = async (req: Request, res: Response) => {
    try {
      const requesterId = req.userId ?? null;
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const projectId = req.params.projectId ?? null;
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
      }

      const parsed = CreateTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        this.logger.warn("Invalid create task payload", {
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        });
      }

      const task = await new CreateTaskUseCase(
        this.taskRepository,
        this.projectRepository,
        this.teamRepository,
        this.eventBus,
        this.logger,
      ).execute(parsed.data, projectId, requesterId);

      return res.status(201).json({ success: true, data: task });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateTask = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const requesterId = req.userId ?? null;
      if (!taskId) {
        return res.status(400).json({ success: false, message: "Task ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = UpdateTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        this.logger.warn("Invalid update task payload", {
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        });
      }

      const task = await new UpdateTaskUseCase(
        this.taskRepository,
        this.projectRepository,
        this.teamRepository,
        this.eventBus,
        this.logger,
      ).execute(taskId, requesterId, parsed.data);

      return res.status(200).json({ success: true, data: task });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  changeTaskStatus = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const requesterId = req.userId ?? null;
      if (!taskId) {
        return res.status(400).json({ success: false, message: "Task ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = ChangeTaskStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        this.logger.warn("Invalid change status payload", {
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        });
      }

      const task = await new ChangeTaskStatusUseCase(
        this.taskRepository,
        this.projectRepository,
        this.teamRepository,
        this.eventBus,
        this.logger,
      ).execute(taskId, requesterId, parsed.data);

      return res.status(200).json({ success: true, data: task });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  assignTask = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const requesterId = req.userId ?? null;
      if (!taskId) {
        return res.status(400).json({ success: false, message: "Task ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = AssignTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        this.logger.warn("Invalid assign task payload", {
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        });
      }

      const task = await new AssignTaskUseCase(
        this.taskRepository,
        this.projectRepository,
        this.teamRepository,
        this.eventBus,
        this.logger,
      ).execute(taskId, requesterId, parsed.data);

      return res.status(200).json({ success: true, data: task });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getTaskById = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const requesterId = req.userId ?? null;
      if (!taskId) {
        return res.status(400).json({ success: false, message: "Task ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const task = await new GetTaskByIdUseCase(
        this.taskRepository,
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(taskId, requesterId);

      return res.status(200).json({ success: true, data: task });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  listTasksByProject = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.projectId;
      const requesterId = req.userId ?? null;
      if (!projectId) {
        return res.status(400).json({ success: false, message: "Project ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const filterInput = {
        status: typeof req.query.status === "string" ? req.query.status : undefined,
        priority: typeof req.query.priority === "string" ? req.query.priority : undefined,
        assigneeId: typeof req.query.assigneeId === "string" ? req.query.assigneeId : undefined,
      };

      const parsed = ListTasksByProjectSchema.safeParse(filterInput);
      if (!parsed.success) {
        this.logger.warn("Invalid list tasks filters", {
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid filters",
        });
      }

      const tasks = await new ListTasksByProjectUseCase(
        this.taskRepository,
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(projectId, requesterId, parsed.data);

      return res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: unknown) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    if (error instanceof DomainError) {
      return res.status(422).json({ success: false, message: error.message });
    }

    this.logger.error("Unexpected task error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
