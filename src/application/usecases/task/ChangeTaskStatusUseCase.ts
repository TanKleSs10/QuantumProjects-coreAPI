import { ChangeTaskStatusDTO } from "@src/domain/dtos/ChangeTaskStatusDTO";
import { Task } from "@src/domain/entities/Task";
import { TaskUpdatedEvent } from "@src/domain/events/TaskEvents";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { IEventBus } from "@src/domain/services/IEventBus";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";
import { HttpError } from "@src/shared/errors/HttpError";

export interface IChangeTaskStatusUseCase {
  execute(taskId: string, requesterId: string, dto: ChangeTaskStatusDTO): Promise<Task>;
}

export class ChangeTaskStatusUseCase implements IChangeTaskStatusUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    private readonly eventBus: IEventBus,
    logger: ILogger,
  ) {
    this.logger = logger.child("ChangeTaskStatusUseCase");
  }

  async execute(
    taskId: string,
    requesterId: string,
    dto: ChangeTaskStatusDTO,
  ): Promise<Task> {
    try {
      this.logger.debug("Changing task status", { taskId, requesterId });

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

      if (!this.canUpdate(team, requesterId, task)) {
        this.logger.warn("Requester cannot change task status", { taskId, requesterId });
        throw new HttpError("Insufficient permissions", 409);
      }

      task.changeStatus(dto.status);

      const saved = await this.taskRepository.saveTask(task);

      await this.eventBus.publish(new TaskUpdatedEvent({
        taskId: saved.id,
        projectId: saved.projectId,
        updatedBy: requesterId,
      }));

      this.logger.info("Task status updated successfully", { taskId: saved.id });
      return saved;
    } catch (error: any) {
      if (error instanceof DomainError || error instanceof HttpError) throw error;

      this.logger.error("Failed to change task status", {
        taskId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to change task status", { cause: error });
    }
  }

  private isTeamMember(team: { ownerId: string; getMember(userId: string): unknown }, userId: string): boolean {
    if (team.ownerId === userId) return true;
    return !!team.getMember(userId);
  }

  private canUpdate(
    team: { ownerId: string; getMember(userId: string): { role: string } | undefined },
    userId: string,
    task: Task,
  ): boolean {
    if (task.assigneeId === userId) return true;
    if (team.ownerId === userId) return true;
    return team.getMember(userId)?.role === "admin";
  }
}
