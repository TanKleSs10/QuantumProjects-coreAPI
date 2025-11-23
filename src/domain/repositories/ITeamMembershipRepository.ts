import { TeamMembership } from "@src/domain/entities/TeamMembership";

export interface ITeamMembershipRepository {
  getMembership(teamId: string, userId: string): Promise<TeamMembership | null>;
}
