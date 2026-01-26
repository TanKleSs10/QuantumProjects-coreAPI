import { Task } from "@src/domain/entities/Task";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

export interface IListTasksByUserUseCase {
  execute(userId: string): Promise<Task[]>;
}

export class ListTasksByUserUseCase implements IListTasksByUserUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("ListTasksByUserUseCase");
  }

  async execute(userId: string): Promise<Task[]> {
    try {
      this.logger.debug("Listing tasks for user", { userId });

      const teams = await this.teamRepository.listTeamsByUser(userId);

      if (!teams) {
        this.logger.error("Team repository returned empty result", { userId });
        throw new ApplicationError("Could not list teams for user tasks");
      }

      if (!teams.length) {
        this.logger.info("No teams found for user", { userId });
        return [];
      }

      const projectGroups = await Promise.all(
        teams.map((team) => this.projectRepository.getProjectsByTeamId(team.id)),
      );
      const projects = projectGroups.flat();

      if (!projects.length) {
        this.logger.info("No projects found for user teams", { userId });
        return [];
      }

      const taskGroups = await Promise.all(
        projects.map((project) => this.taskRepository.listTasksByProject(project.id)),
      );
      const tasks = taskGroups.flat();

      if (!tasks) {
        this.logger.error("Task repository returned empty result", { userId });
        throw new ApplicationError("Could not list tasks by user");
      }

      if (!tasks.length) {
        this.logger.info("No tasks found for user", { userId });
        return [];
      }

      this.logger.info("Tasks retrieved successfully", {
        userId,
        count: tasks.length,
      });

      return tasks;
    } catch (error: any) {
      this.logger.error("Failed to list tasks by user", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to list tasks by user", {
        cause: error,
      });
    }
  }
}
