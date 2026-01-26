import { Types } from "mongoose";
import { DocumentType } from "@typegoose/typegoose";
import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";
import { TeamModel } from "@src/infrastructure/database/models/TeamModel";

export class TeamMapper {
  private static refToId(ref: unknown): string {
    if (!ref) return "";
    if (typeof ref === "string") return ref;
    if (ref instanceof Types.ObjectId) return ref.toString();
    if (typeof ref === "object") {
      const maybeRef = ref as { _id?: unknown; id?: unknown };
      const rawId = maybeRef._id ?? maybeRef.id;
      if (rawId) return rawId.toString?.() ?? String(rawId);
    }
    return String(ref);
  }

  static toDomain(model: DocumentType<TeamModel>): Team {
    return new Team(
      model._id.toString(),
      model.name,
      TeamMapper.refToId(model.owner),
      model.members?.map(
        (m) => new TeamMembership(TeamMapper.refToId(m.user), m.role),
      ) ?? [],
      model.description,
    );
  }

  static toPersistence(team: Team): Partial<TeamModel> {
    return {
      name: team.name,
      description: team.description,
      owner: new Types.ObjectId(team.ownerId),
      members: team.getMembers().map((m) => ({
        user: new Types.ObjectId(m.userId),
        role: m.role,
      })),
    };
  }
}
