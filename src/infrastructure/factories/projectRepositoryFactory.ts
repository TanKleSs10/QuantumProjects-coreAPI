import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { MongoProjectDatasource } from "@src/infrastructure/datasources/MongoProjectDatasource";
import { ProjectRepository } from "@src/infrastructure/repositories/ProjectRepository";

const projectDatasource = new MongoProjectDatasource();

export const projectRepository: IProjectRepository = new ProjectRepository(
  projectDatasource,
);
