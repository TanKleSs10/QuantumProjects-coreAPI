import { Types } from "mongoose";
import { DocumentType } from "@typegoose/typegoose";
import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";
import { TeamModel } from "@src/infrastructure/database/models/TeamModel";

export class TeamMapper {
  static toDomain(model: DocumentType<TeamModel>): Team {
    return new Team(
      model._id.toString(),
      model.name,
      model.owner.toString(),
      model.members?.map(
        (m) => new TeamMembership(m.user.toString(), m.role),
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

