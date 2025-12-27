import { CreateProjectDTO } from "@src/domain/dtos/CreateProjectDTO";
import { Project } from "@src/domain/entities/Project";
import { Team } from "@src/domain/entities/Team";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface ICreateProjectUseCase {
  execute(dto: CreateProjectDTO, teamId: string, requesterId: string): Promise<Project>;
}

export class CreateProjectUseCase implements ICreateProjectUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("CreateProjectUseCase");
  }

  async execute(
    dto: CreateProjectDTO,
    teamId: string,
    requesterId: string,
  ): Promise<Project> {
    try {
      this.logger.debug("Creating project", { teamId, requesterId });

      const team = await this.teamRepository.getTeamById(teamId);
      if (!team) {
        this.logger.warn("Team not found", { teamId });
        throw new DomainError("Team not found");
      }

      if (!this.isOwnerOrAdmin(team, requesterId)) {
        this.logger.warn("Unauthorized project creation attempt", {
          teamId,
          requesterId,
        });
        throw new DomainError("Insufficient permissions");
      }

      const project = new Project(
        "new",
        dto.name,
        teamId,
        requesterId,
        undefined,
        dto.description,
        dto.tags ?? [],
        dto.deadline,
      );

      const created = await this.projectRepository.createProject(project);

      if (!created) {
        this.logger.error("Project repository returned empty result", {
          teamId,
        });
        throw new ApplicationError("Could not create project");
      }

      this.logger.info("Project created successfully", {
        projectId: created.id,
      });

      return created;
    } catch (error: any) {
      if (error instanceof DomainError) throw error;

      this.logger.error("Failed to create project", {
        teamId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Failed to create project", { cause: error });
    }
  }

  private isOwnerOrAdmin(team: Team, userId: string): boolean {
    if (team.ownerId === userId) return true;
    return team.getMember(userId)?.role === "admin";
  }
}
