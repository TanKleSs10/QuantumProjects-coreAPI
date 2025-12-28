import { ListTasksByProjectDTO } from "@src/domain/dtos/ListTasksByProjectDTO";
import { Task } from "@src/domain/entities/Task";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { HttpError } from "@src/shared/errors/HttpError";

export interface IListTasksByProjectUseCase {
  execute(
    projectId: string,
    requesterId: string,
    filters: ListTasksByProjectDTO,
  ): Promise<Task[]>;
}

export class ListTasksByProjectUseCase implements IListTasksByProjectUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("ListTasksByProjectUseCase");
  }

  async execute(
    projectId: string,
    requesterId: string,
    filters: ListTasksByProjectDTO,
  ): Promise<Task[]> {
    try {
      this.logger.debug("Listing tasks by project", { projectId, requesterId });

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
        this.logger.warn("Requester not in project team", { projectId, requesterId });
        throw new HttpError("Insufficient permissions", 409);
      }

      const tasks = await this.taskRepository.listTasksByProject(projectId, filters);

      this.logger.info("Tasks retrieved successfully", {
        projectId,
        count: tasks.length,
      });
      return tasks;
    } catch (error: any) {
      if (error instanceof HttpError) throw error;

      this.logger.error("Failed to list tasks by project", {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to list tasks by project", {
        cause: error,
      });
    }
  }

  private isTeamMember(team: { ownerId: string; getMember(userId: string): unknown }, userId: string): boolean {
    if (team.ownerId === userId) return true;
    return !!team.getMember(userId);
  }
}
