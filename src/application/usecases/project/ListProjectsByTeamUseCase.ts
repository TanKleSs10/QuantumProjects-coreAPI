import { Project } from "@src/domain/entities/Project";
import { Team } from "@src/domain/entities/Team";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IListProjectsByTeamUseCase {
  execute(teamId: string, requesterId: string): Promise<Project[]>;
}

export class ListProjectsByTeamUseCase implements IListProjectsByTeamUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("ListProjectsByTeamUseCase");
  }

  async execute(teamId: string, requesterId: string): Promise<Project[]> {
    try {
      this.logger.debug("Listing projects by team", { teamId, requesterId });

      const team = await this.teamRepository.getTeamById(teamId);
      if (!team) {
        this.logger.warn("Team not found", { teamId });
        throw new DomainError("Team not found");
      }

      if (!this.isTeamMember(team, requesterId)) {
        this.logger.warn("Unauthorized team project list attempt", {
          teamId,
          requesterId,
        });
        throw new DomainError("Insufficient permissions");
      }

      const projects = await this.projectRepository.getProjectsByTeamId(teamId);
      this.logger.info("Projects listed successfully", {
        teamId,
        count: projects.length,
      });
      return projects;
    } catch (error: any) {
      if (error instanceof DomainError) throw error;

      this.logger.error("Failed to list projects by team", {
        teamId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Could not list projects by team", {
        cause: error,
      });
    }
  }

  private isTeamMember(team: Team, userId: string): boolean {
    if (team.ownerId === userId) return true;
    return !!team.getMember(userId);
  }
}
