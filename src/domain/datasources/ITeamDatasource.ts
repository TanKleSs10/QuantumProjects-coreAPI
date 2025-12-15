import { CreateTeamDTO } from "../dtos/CreateTeamDTO";
import { UpdateTeamDTO } from "../dtos/UpdateTeamDTO";
import { Team } from "../entities/Team";
import { TeamMembership } from "../entities/TeamMembership";

export interface ITeamDatasource {
  // Teams
  createTeam(teamData: CreateTeamDTO): Promise<Team>;
  getTeamById(teamId: string): Promise<Team>;
  getTeamByName(name: string): Promise<Team>;
  updateTeam(
    teamId: string,
    data: UpdateTeamDTO): Promise<Team>;
  deleteTeam(teamId: string): Promise<void>;

  // Queries
  listTeamsByUser(userId: string): Promise<Team[]>;
  
}
