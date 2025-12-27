import { Project } from "@src/domain/entities/Project";
import { Team } from "@src/domain/entities/Team";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IGetProjectByIdUseCase {
  execute(projectId: string, requesterId: string): Promise<Project>;
}

export class GetProjectByIdUseCase implements IGetProjectByIdUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("GetProjectByIdUseCase");
  }

  async execute(projectId: string, requesterId: string): Promise<Project> {
    try {
      this.logger.debug("Fetching project by id", { projectId });

      const project = await this.projectRepository.getProjectById(projectId);
      if (!project) {
        this.logger.warn("Project not found", { projectId });
        throw new DomainError("Project not found");
      }

      const team = await this.teamRepository.getTeamById(project.teamId);
      if (!team) {
        this.logger.warn("Team not found for project", {
          projectId,
          teamId: project.teamId,
        });
        throw new DomainError("Team not found");
      }

      if (!this.isTeamMember(team, requesterId)) {
        this.logger.warn("Unauthorized project access", {
          projectId,
          requesterId,
        });
        throw new DomainError("Insufficient permissions");
      }

      this.logger.info("Project retrieved successfully", { projectId });
      return project;
    } catch (error: any) {
      if (error instanceof DomainError) throw error;

      this.logger.error("Error retrieving project by id", {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Could not retrieve project by id", {
        cause: error,
      });
    }
  }

  private isTeamMember(team: Team, userId: string): boolean {
    if (team.ownerId === userId) return true;
    return !!team.getMember(userId);
  }
}
