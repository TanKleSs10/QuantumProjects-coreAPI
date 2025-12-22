import { CreateTeamDTO } from "@src/domain/dtos/CreateTeamDTO";
import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

export interface ICreateTeamUseCase {
  execute(dto: CreateTeamDTO, ownerId: string): Promise<Team>;
}

export class CreateTeamUseCase implements ICreateTeamUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("CreateTeamUseCase");
  }

  async execute(dto: CreateTeamDTO, ownerId: string): Promise<Team> {
    try {
      this.logger.debug("Creating team", { ownerId, name: dto.name });

      const team = new Team(
        "new",
        dto.name,
        ownerId,
        [TeamMembership.createOwner(ownerId)],
        dto.description,
      );

      const created = await this.teamRepository.createTeam(team);

      if (!created) {
        this.logger.error("Team repository returned empty result", { ownerId });
        throw new ApplicationError("Could not create team");
      }

      this.logger.info("Team created successfully", { teamId: created.id });
      return created;
    } catch (error: any) {
      this.logger.error("Failed to create team", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to create team", { cause: error });
    }
  }
}
