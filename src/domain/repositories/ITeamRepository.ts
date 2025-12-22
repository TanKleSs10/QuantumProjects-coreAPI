import { Team } from "../entities/Team";

export interface ITeamRepository {
  // Teams
  createTeam(team: Team): Promise<Team>;
  getTeamById(teamId: string): Promise<Team>;
  saveTeam(team: Team): Promise<Team>;
  deleteTeam(teamId: string): Promise<void>;

  // Queries
  listTeamsByUser(userId: string): Promise<Team[]>;
}
