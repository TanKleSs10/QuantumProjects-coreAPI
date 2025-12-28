import { AssignTaskDTO } from "@src/domain/dtos/AssignTaskDTO";
import { Task } from "@src/domain/entities/Task";
import { TaskAssignedEvent } from "@src/domain/events/TaskEvents";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { IEventBus } from "@src/domain/services/IEventBus";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";
import { HttpError } from "@src/shared/errors/HttpError";

export interface IAssignTaskUseCase {
  execute(taskId: string, requesterId: string, dto: AssignTaskDTO): Promise<Task>;
}

export class AssignTaskUseCase implements IAssignTaskUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    private readonly eventBus: IEventBus,
    logger: ILogger,
  ) {
    this.logger = logger.child("AssignTaskUseCase");
  }

  async execute(taskId: string, requesterId: string, dto: AssignTaskDTO): Promise<Task> {
    try {
      this.logger.debug("Assigning task", { taskId, requesterId });

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

      if (!this.isOwnerOrAdmin(team, requesterId)) {
        this.logger.warn("Requester cannot assign task", { taskId, requesterId });
        throw new HttpError("Insufficient permissions", 409);
      }

      if (!this.isTeamMember(team, dto.assigneeId)) {
        this.logger.warn("Assignee is not part of the team", {
          taskId,
          assigneeId: dto.assigneeId,
        });
        throw new HttpError("Assignee must belong to the project team", 409);
      }

      task.assignTo(dto.assigneeId);
      const saved = await this.taskRepository.saveTask(task);

      await this.eventBus.publish(new TaskAssignedEvent({
        taskId: saved.id,
        projectId: saved.projectId,
        assigneeId: dto.assigneeId,
        assignedBy: requesterId,
      }));

      this.logger.info("Task assigned successfully", { taskId: saved.id });
      return saved;
    } catch (error: any) {
      if (error instanceof DomainError || error instanceof HttpError) throw error;

      this.logger.error("Failed to assign task", {
        taskId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to assign task", { cause: error });
    }
  }

  private isTeamMember(team: { ownerId: string; getMember(userId: string): unknown }, userId: string): boolean {
    if (team.ownerId === userId) return true;
    return !!team.getMember(userId);
  }

  private isOwnerOrAdmin(team: { ownerId: string; getMember(userId: string): { role: string } | undefined }, userId: string): boolean {
    if (team.ownerId === userId) return true;
    return team.getMember(userId)?.role === "admin";
  }
}
