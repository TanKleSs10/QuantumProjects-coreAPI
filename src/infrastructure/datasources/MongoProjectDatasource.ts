import { InfrastructureError } from "@src/shared/errors/InfrastructureError";
import { IProjectDatasource } from "@src/domain/datasources/IProjectDatasource";
import { Project } from "@src/domain/entities/Project";
import { ProjectMongoModel } from "../database/models/ProjectModel";
import { ProjectMapper } from "../mappers/ProjectMapper";

export class MongoProjectDatasource implements IProjectDatasource {
  async createProject(project: Project): Promise<Project> {
    try {
      const created = await ProjectMongoModel.create(
        ProjectMapper.toPersistence(project),
      );
      return ProjectMapper.toDomain(created);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error creating project", { cause: error });
    }
  }

  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const found = await ProjectMongoModel.findById(projectId);
      if (!found) return null;
      return ProjectMapper.toDomain(found);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error retrieving project by id", {
        cause: error,
      });
    }
  }

  async getProjectsByTeamId(teamId: string): Promise<Project[]> {
    try {
      const projects = await ProjectMongoModel.find({ team: teamId });
      return projects.map((project) => ProjectMapper.toDomain(project));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error retrieving projects by team", {
        cause: error,
      });
    }
  }

  async saveProject(project: Project): Promise<Project> {
    try {
      const updated = await ProjectMongoModel.findByIdAndUpdate(
        project.id,
        { $set: ProjectMapper.toPersistence(project) },
        { new: true },
      );
      if (!updated) throw new InfrastructureError("Project not found");
      return ProjectMapper.toDomain(updated);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error updating project", { cause: error });
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const deleted = await ProjectMongoModel.findByIdAndDelete(projectId);
      if (!deleted) throw new InfrastructureError("Project not found");
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error deleting project", { cause: error });
    }
  }
}
