import { Team } from "@src/domain/entities/Team";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IPromoteMemberUseCase {
  execute(teamId: string, requesterId: string, userId: string): Promise<Team>;
}

export class PromoteMemberUseCase implements IPromoteMemberUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("PromoteMemberUseCase");
  }

  async execute(
    teamId: string,
    requesterId: string,
    userId: string,
  ): Promise<Team> {
    try {
      this.logger.debug("Promoting team member", { teamId, userId });

      const team = await this.teamRepository.getTeamById(teamId);

      if (!team) {
        this.logger.warn("Team not found", { teamId });
        throw new DomainError("Team not found");
      }

      if (team.ownerId !== requesterId) {
        throw new DomainError("Insufficient permissions");
      }

      try {
        team.promoteToAdmin(userId);
      } catch (error: any) {
        this.logger.warn("Failed to promote team member", {
          teamId,
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
        throw new DomainError(
          error instanceof Error ? error.message : "Invalid team member",
        );
      }

      const updated = await this.teamRepository.saveTeam(team);

      this.logger.info("Team member promoted", {
        teamId: updated.id,
        userId,
      });

      return updated;
    } catch (error: any) {
      if (error instanceof DomainError) throw error;

      this.logger.error("Error promoting team member", {
        teamId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Could not promote team member", {
        cause: error,
      });
    }
  }
}
