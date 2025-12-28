import { CreateTaskDTO } from "@src/domain/dtos/CreateTaskDTO";
import { Task } from "@src/domain/entities/Task";
import { TaskCreatedEvent } from "@src/domain/events/TaskEvents";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { IEventBus } from "@src/domain/services/IEventBus";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";
import { HttpError } from "@src/shared/errors/HttpError";

export interface ICreateTaskUseCase {
  execute(dto: CreateTaskDTO, projectId: string, requesterId: string): Promise<Task>;
}

export class CreateTaskUseCase implements ICreateTaskUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    private readonly eventBus: IEventBus,
    logger: ILogger,
  ) {
    this.logger = logger.child("CreateTaskUseCase");
  }

  async execute(
    dto: CreateTaskDTO,
    projectId: string,
    requesterId: string,
  ): Promise<Task> {
    try {
      this.logger.debug("Creating task", { projectId, requesterId });

      const project = await this.projectRepository.getProjectById(projectId);
      if (!project) {
        this.logger.warn("Project not found", { projectId });
        throw new HttpError("Project not found", 404);
      }

      const team = await this.teamRepository.getTeamById(project.teamId);
      if (!team) {
        this.logger.warn("Team not found for project", { projectId });
        throw new HttpError("Team not found", 404);
      }

      if (!this.isTeamMember(team, requesterId)) {
        this.logger.warn("Requester not in project team", {
          projectId,
          requesterId,
        });
        throw new HttpError("Insufficient permissions", 409);
      }

      if (!this.isOwnerOrAdmin(team, requesterId)) {
        this.logger.warn("Requester cannot create task", {
          projectId,
          requesterId,
        });
        throw new HttpError("Insufficient permissions", 409);
      }

      if (dto.assigneeId && !this.isTeamMember(team, dto.assigneeId)) {
        this.logger.warn("Assignee is not part of the team", {
          projectId,
          assigneeId: dto.assigneeId,
        });
        throw new HttpError("Assignee must belong to the project team", 409);
      }

      const task = new Task({
        id: "new",
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        projectId,
        assigneeId: dto.assigneeId,
        createdBy: requesterId,
        dueDate: dto.dueDate,
        tags: dto.tags,
      });

      const created = await this.taskRepository.createTask(task);
      if (!created) {
        this.logger.error("Task repository returned empty result", {
          projectId,
        });
        throw new ApplicationError("Could not create task");
      }

      await this.eventBus.publish(new TaskCreatedEvent({
        taskId: created.id,
        projectId: created.projectId,
        createdBy: requesterId,
      }));

      this.logger.info("Task created successfully", {
        taskId: created.id,
      });
      return created;
    } catch (error: any) {
      if (error instanceof DomainError || error instanceof HttpError) throw error;

      this.logger.error("Failed to create task", {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to create task", { cause: error });
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
