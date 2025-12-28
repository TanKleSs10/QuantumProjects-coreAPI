import { Task } from "@src/domain/entities/Task";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { HttpError } from "@src/shared/errors/HttpError";

export interface IGetTaskByIdUseCase {
  execute(taskId: string, requesterId: string): Promise<Task>;
}

export class GetTaskByIdUseCase implements IGetTaskByIdUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("GetTaskByIdUseCase");
  }

  async execute(taskId: string, requesterId: string): Promise<Task> {
    try {
      this.logger.debug("Fetching task by id", { taskId, requesterId });

      const task = await this.taskRepository.getTaskById(taskId);
      if (!task) {
        this.logger.warn("Task not found", { taskId });
        throw new HttpError("Task not found", 404);
      }

      const project = await this.projectRepository.getProjectById(task.projectId);
      if (!project) {
        this.logger.warn("Project not found for task", { taskId });
        throw new HttpError("Project not found", 404);
      }

      const team = await this.teamRepository.getTeamById(project.teamId);
      if (!team) {
        this.logger.warn("Team not found for task", { taskId });
        throw new HttpError("Team not found", 404);
      }

      if (!this.isTeamMember(team, requesterId)) {
        this.logger.warn("Requester not in project team", { taskId, requesterId });
        throw new HttpError("Insufficient permissions", 409);
      }

      this.logger.info("Task retrieved successfully", { taskId });
      return task;
    } catch (error: any) {
      if (error instanceof HttpError) throw error;

      this.logger.error("Failed to retrieve task", {
        taskId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to retrieve task", { cause: error });
    }
  }

  private isTeamMember(team: { ownerId: string; getMember(userId: string): unknown }, userId: string): boolean {
    if (team.ownerId === userId) return true;
    return !!team.getMember(userId);
  }
}
