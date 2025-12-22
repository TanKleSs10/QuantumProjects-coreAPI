import { InviteMemberDTO } from "@src/domain/dtos/InvitateMemberDTO";
import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IAddMemberUseCase {
  execute(teamId: string, requesterId: string, dto: InviteMemberDTO): Promise<Team>;
}

export class AddMemberUseCase implements IAddMemberUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("AddMemberUseCase");
  }

  async execute(
    teamId: string,
    requesterId: string,
    dto: InviteMemberDTO,
  ): Promise<Team> {
    try {
      this.logger.debug("Adding team member", { teamId, userId: dto.userId });

      const team = await this.teamRepository.getTeamById(teamId);

      if (!team) {
        this.logger.warn("Team not found", { teamId });
        throw new DomainError("Team not found");
      }

      const membership =
        dto.role === "admin"
          ? TeamMembership.createAdmin(dto.userId)
          : TeamMembership.createMember(dto.userId);

      if (!this.isOwner(team, requesterId)) {
        throw new DomainError("Insufficient permissions");
      }

      try {
        team.addMember(membership);
      } catch (error: any) {
        this.logger.warn("Failed to add team member", {
          teamId,
          userId: dto.userId,
          error: error instanceof Error ? error.message : String(error),
        });
        throw new DomainError(
          error instanceof Error ? error.message : "Invalid team member",
        );
      }

      const updated = await this.teamRepository.saveTeam(team);

      this.logger.info("Team member added", {
        teamId: updated.id,
        userId: dto.userId,
      });

      return updated;
    } catch (error: any) {
      if (error instanceof DomainError) throw error;

      this.logger.error("Error adding team member", {
        teamId,
        userId: dto.userId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Could not add team member", { cause: error });
    }
  }

  private isOwner(team: Team, requesterId: string): boolean {
    return team.ownerId === requesterId;
  }
}
