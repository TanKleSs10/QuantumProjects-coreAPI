import { Team } from "@src/domain/entities/Team";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IGetTeamByIdUseCase {
  execute(teamId: string, requesterId: string): Promise<Team>;
}

export class GetTeamByIdUseCase implements IGetTeamByIdUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("GetTeamByIdUseCase");
  }

  async execute(teamId: string, requesterId: string): Promise<Team> {
    try {
      this.logger.debug("Fetching team by id", { teamId });

      const team = await this.teamRepository.getTeamById(teamId);

      if (!team) {
        this.logger.warn("Team not found", { teamId });
        throw new DomainError("Team not found");
      }

      const isMember = team.ownerId === requesterId || !!team.getMember(requesterId);
      if (!isMember) {
        this.logger.warn("Unauthorized team access", { teamId, requesterId });
        throw new DomainError("Insufficient permissions");
      }

      this.logger.info("Team retrieved successfully", { teamId: team.id });
      return team;
    } catch (error: any) {
      if (error instanceof DomainError) throw error;

      this.logger.error("Error retrieving team by id", {
        teamId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Could not retrieve team by id", {
        cause: error,
      });
    }
  }
}
