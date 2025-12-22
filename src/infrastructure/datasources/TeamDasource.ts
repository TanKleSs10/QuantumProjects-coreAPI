import { InfrastructureError } from "@src/shared/errors/InfrastructureError";
import { ITeamDatasource } from "@src/domain/datasources/ITeamDatasource";
import { Team } from "@src/domain/entities/Team";
import { TeamMongoModel } from "../database/models/TeamModel";
import { TeamMapper } from "../mappers/TeamMapper";

export class TeamDatasource implements ITeamDatasource {
  async createTeam(team: Team): Promise<Team> {
    try {
      const created = await TeamMongoModel.create(TeamMapper.toPersistence(team));
      return TeamMapper.toDomain(created);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error creating team", { cause: error });
    }
  }

  async getTeamById(teamId: string): Promise<Team> {
    try {
      const found = await TeamMongoModel.findById(teamId);
      if (!found) throw new InfrastructureError("Team not found");
      return TeamMapper.toDomain(found);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error retrieving team by id", { cause: error });
    }
  }

  async saveTeam(team: Team): Promise<Team> {
    try {
      const updated = await TeamMongoModel.findByIdAndUpdate(
        team.id,
        { $set: TeamMapper.toPersistence(team) },
        { new: true },
      );
      if (!updated) throw new InfrastructureError("Team not found");
      return TeamMapper.toDomain(updated);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error updating team", { cause: error });
    }
  }

  async deleteTeam(teamId: string): Promise<void> {
    try {
      const deleted = await TeamMongoModel.findByIdAndDelete(teamId);
      if (!deleted) throw new InfrastructureError("Team not found");
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error deleting team", { cause: error });
    }
  }

  async listTeamsByUser(userId: string): Promise<Team[]> {
    try {
      const teams = await TeamMongoModel.find({ "members.user": userId });
      if (!teams) throw new InfrastructureError("Error querying teams");
      return teams.map((t) => TeamMapper.toDomain(t));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error listing teams by user", { cause: error });
    }
  }
}
