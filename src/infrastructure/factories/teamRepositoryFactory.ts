import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { TeamDatasource } from "@src/infrastructure/datasources/TeamDasource";
import { TeamRepository } from "@src/infrastructure/repositories/TeamRepository";

const teamDatasource = new TeamDatasource();

export const teamRepository: ITeamRepository = new TeamRepository(teamDatasource);
