import { Team } from "@src/domain/entities/Team";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IRemoveMemberUseCase {
  execute(teamId: string, requesterId: string, userId: string): Promise<Team>;
}

export class RemoveMemberUseCase implements IRemoveMemberUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("RemoveMemberUseCase");
  }

  async execute(
    teamId: string,
    requesterId: string,
    userId: string,
  ): Promise<Team> {
    try {
      this.logger.debug("Removing team member", { teamId, userId });

      const team = await this.teamRepository.getTeamById(teamId);

      if (!team) {
        this.logger.warn("Team not found", { teamId });
        throw new DomainError("Team not found");
      }

      if (!this.canRemoveMember(team, requesterId, userId)) {
        throw new DomainError("Insufficient permissions");
      }

      try {
        team.removeMember(userId);
      } catch (error: any) {
        this.logger.warn("Failed to remove team member", {
          teamId,
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
        throw new DomainError(
          error instanceof Error ? error.message : "Invalid team member",
        );
      }

      const updated = await this.teamRepository.saveTeam(team);

      this.logger.info("Team member removed", {
        teamId: updated.id,
        userId,
      });

      return updated;
    } catch (error: any) {
      if (error instanceof DomainError) throw error;

      this.logger.error("Error removing team member", {
        teamId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Could not remove team member", {
        cause: error,
      });
    }
  }

  private canRemoveMember(
    team: Team,
    requesterId: string,
    userId: string,
  ): boolean {
    if (team.ownerId === requesterId) return true;
    return requesterId === userId;
  }
}
