import { Team } from "@src/domain/entities/Team";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

export interface IListTeamsByUserUseCase {
  execute(userId: string): Promise<Team[] | []>;
}

export class ListTeamsByUserUseCase implements IListTeamsByUserUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("ListTeamsByUserUseCase");
  }

  async execute(userId: string): Promise<Team[] | []> {
    try {
      this.logger.debug("Listing teams for user", { userId });

      const teams = await this.teamRepository.listTeamsByUser(userId);

      if (!teams) {
        this.logger.error("Team repository returned empty result", { userId });
        throw new ApplicationError("Could not list teams by user");
      }

      if (!teams.length) {
        this.logger.info("No teams found for user", { userId });
        return [];
      }

      this.logger.info("Teams retrieved successfully", {
        userId,
        count: teams.length,
      });

      return teams;
    } catch (error: any) {
      this.logger.error("Failed to list teams by user", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to list teams by user", {
        cause: error,
      });
    }
  }
}
