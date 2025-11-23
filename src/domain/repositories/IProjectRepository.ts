import { Project } from "@src/domain/entities/Project";

export interface IProjectRepository {
  getProjectById(id: string): Promise<Project | null>;
}
