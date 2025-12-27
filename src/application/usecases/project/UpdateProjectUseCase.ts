import { UpdateProjectDTO } from "@src/domain/dtos/UpdateProjectDTO";
import { Project } from "@src/domain/entities/Project";
import { Team } from "@src/domain/entities/Team";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IUpdateProjectUseCase {
  execute(projectId: string, requesterId: string, dto: UpdateProjectDTO): Promise<Project>;
}

export class UpdateProjectUseCase implements IUpdateProjectUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("UpdateProjectUseCase");
  }

  async execute(
    projectId: string,
    requesterId: string,
    dto: UpdateProjectDTO,
  ): Promise<Project> {
    try {
      this.logger.debug("Updating project", { projectId, requesterId, dto });

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
        this.logger.warn("Unauthorized project update attempt", {
          projectId,
          requesterId,
        });
        throw new DomainError("Insufficient permissions");
      }

      if (dto.name) {
        try {
          project.rename(dto.name);
        } catch (error: any) {
          throw new DomainError(
            error instanceof Error ? error.message : "Invalid project name",
          );
        }
      }

      if (dto.description !== undefined) {
        project.description = dto.description;
      }

      if (dto.tags !== undefined) {
        project.tags = dto.tags;
      }

      if (dto.deadline !== undefined) {
        project.deadline = dto.deadline;
      }

      const updated = await this.projectRepository.saveProject(project);

      this.logger.info("Project updated successfully", { projectId });
      return updated;
    } catch (error: any) {
      if (error instanceof DomainError) throw error;

      this.logger.error("Failed to update project", {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Could not update project", { cause: error });
    }
  }

  private isOwnerOrAdmin(team: Team, userId: string): boolean {
    if (team.ownerId === userId) return true;
    return team.getMember(userId)?.role === "admin";
  }
}
