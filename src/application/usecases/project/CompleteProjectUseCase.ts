import { Project } from "@src/domain/entities/Project";
import { Team } from "@src/domain/entities/Team";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface ICompleteProjectUseCase {
  execute(projectId: string, requesterId: string): Promise<Project>;
}

export class CompleteProjectUseCase implements ICompleteProjectUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("CompleteProjectUseCase");
  }

  async execute(projectId: string, requesterId: string): Promise<Project> {
    try {
      this.logger.debug("Completing project", { projectId, requesterId });

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

      if (!this.isOwnerOrAdmin(team, requesterId)) {
        this.logger.warn("Unauthorized project completion attempt", {
          projectId,
          requesterId,
        });
        throw new DomainError("Insufficient permissions");
      }

      try {
        project.complete();
      } catch (error: any) {
        throw new DomainError(
          error instanceof Error ? error.message : "Invalid project state",
        );
      }

      const updated = await this.projectRepository.saveProject(project);

      this.logger.info("Project completed", { projectId });
      return updated;
    } catch (error: any) {
      if (error instanceof DomainError) throw error;

      this.logger.error("Failed to complete project", {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Could not complete project", { cause: error });
    }
  }

  private isOwnerOrAdmin(team: Team, userId: string): boolean {
    if (team.ownerId === userId) return true;
    return team.getMember(userId)?.role === "admin";
  }
}
