import { Project } from "@src/domain/entities/Project";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

export interface IListProjectsByUserUseCase {
  execute(userId: string): Promise<Project[]>;
}

export class ListProjectsByUserUseCase implements IListProjectsByUserUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("ListProjectsByUserUseCase");
  }

  async execute(userId: string): Promise<Project[]> {
    try {
      this.logger.debug("Listing projects for user", { userId });

      const teams = await this.teamRepository.listTeamsByUser(userId);

      if (!teams) {
        this.logger.error("Team repository returned empty result", { userId });
        throw new ApplicationError("Could not list teams for user projects");
      }

      if (!teams.length) {
        this.logger.info("No teams found for user", { userId });
        return [];
      }

      const projectGroups = await Promise.all(
        teams.map((team) => this.projectRepository.getProjectsByTeamId(team.id)),
      );
      const projects = projectGroups.flat();

      if (!projects) {
        this.logger.error("Project repository returned empty result", {
          userId,
        });
        throw new ApplicationError("Could not list projects by user");
      }

      if (!projects.length) {
        this.logger.info("No projects found for user", { userId });
        return [];
      }

      this.logger.info("Projects retrieved successfully", {
        userId,
        count: projects.length,
      });

      return projects;
    } catch (error: any) {
      this.logger.error("Failed to list projects by user", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to list projects by user", {
        cause: error,
      });
    }
  }
}
