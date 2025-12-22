import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";

export class TeamMapper {
  static toDomain(raw: any): Team {
    return new Team(
      raw._id.toString(),
      raw.name,
      raw.owner?.toString?.() ?? raw.owner,
      raw.members?.map(
        (m: any) => new TeamMembership(m.user?.toString?.() ?? m.user, m.role),
      ) ?? [],
      raw.description,
    );
  }

  static toPersistence(team: Team): any {
    return {
      name: team.name,
      description: team.description,
      owner: team.ownerId,
      members: team.getMembers().map((m) => ({
        user: m.userId,
        role: m.role,
      })),
    };
  }
}
