import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";

export class TeamMapper {
  static toDomain(raw: any): Team {
    return new Team(
      raw._id.toString(),
      raw.name,
      raw.owner,
      raw.members?.map(
        (m: any) => new TeamMembership(raw._id.toString(), m.user.toString(), m.role),
      ) ?? [],
      raw.description,
    );
  }
}