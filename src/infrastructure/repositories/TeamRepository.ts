import { ITeamDatasource } from "@src/domain/datasources/ITeamDatasource";
import { Team } from "@src/domain/entities/Team";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";

export class TeamRepository implements ITeamRepository {
  constructor(
    private readonly teamDatasource: ITeamDatasource
  ) { }

  async createTeam(team: Team): Promise<Team> {
    return await this.teamDatasource.createTeam(team);
  }
  async getTeamById(teamId: string): Promise<Team> {
    return await this.teamDatasource.getTeamById(teamId)
  }
  async saveTeam(team: Team): Promise<Team> {
    return await this.teamDatasource.saveTeam(team)
  }
  deleteTeam(teamId: string): Promise<void> {
    return this.teamDatasource.deleteTeam(teamId)
  }
  listTeamsByUser(userId: string): Promise<Team[]> {
    return this.teamDatasource.listTeamsByUser(userId)
  }

}
