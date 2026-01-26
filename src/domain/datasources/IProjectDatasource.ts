import { Project } from "../entities/Project";

export interface IProjectDatasource {
  createProject(project: Project): Promise<Project>;
  getProjectById(projectId: string): Promise<Project | null>;
  getProjectsByTeamId(teamId: string): Promise<Project[]>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  saveProject(project: Project): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;
}
