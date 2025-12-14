import { CreateTeamDTO } from "../dtos/CreateTeamDTO";
import { Team } from "../entities/Team";

export interface ITeamDatasource {
  createTeam(teamData: CreateTeamDTO): Promise<Team>;
}
