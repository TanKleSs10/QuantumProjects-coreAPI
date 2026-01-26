import { IProjectDatasource } from "@src/domain/datasources/IProjectDatasource";
import { Project } from "@src/domain/entities/Project";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";

export class ProjectRepository implements IProjectRepository {
  constructor(
    private readonly projectDatasource: IProjectDatasource,
  ) { }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return this.projectDatasource.getProjectsByUserId(userId);
  }

  async createProject(project: Project): Promise<Project> {
    return this.projectDatasource.createProject(project);
  }

  async getProjectById(projectId: string): Promise<Project | null> {
    return this.projectDatasource.getProjectById(projectId);
  }

  async getProjectsByTeamId(teamId: string): Promise<Project[]> {
    return this.projectDatasource.getProjectsByTeamId(teamId);
  }

  async saveProject(project: Project): Promise<Project> {
    return this.projectDatasource.saveProject(project);
  }

  async deleteProject(projectId: string): Promise<void> {
    return this.projectDatasource.deleteProject(projectId);
  }
}
