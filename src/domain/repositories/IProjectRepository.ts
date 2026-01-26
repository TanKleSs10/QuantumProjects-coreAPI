
import { Project } from "@src/domain/entities/Project";

export interface IProjectRepository {
  getProjectById(projectId: string): Promise<Project | null>;
  getProjectsByTeamId(teamId: string): Promise<Project[]>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  createProject(project: Project): Promise<Project>;
  saveProject(project: Project): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;
}
