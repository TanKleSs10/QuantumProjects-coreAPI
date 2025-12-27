import { Project } from "../entities/Project";

export interface IProjectDatasource {
  createProject(project: Project): Promise<Project>;
  getProjectById(projectId: string): Promise<Project | null>;
  saveProject(project: Project): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;
}
