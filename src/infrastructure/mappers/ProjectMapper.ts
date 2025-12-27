import { Types } from "mongoose";
import { DocumentType } from "@typegoose/typegoose";
import { Project } from "@src/domain/entities/Project";
import { ProjectModel, ProjectStatus } from "@src/infrastructure/database/models/ProjectModel";

export class ProjectMapper {
  static toDomain(model: DocumentType<ProjectModel>): Project {
    return new Project(
      model._id.toString(),
      model.name,
      model.team.toString(),
      model.createdBy.toString(),
      model.status as ProjectStatus,
      model.description,
      model.tags ?? [],
      model.deadline,
    );
  }

  static toPersistence(project: Project): Partial<ProjectModel> {
    return {
      name: project.name,
      description: project.description,
      team: new Types.ObjectId(project.teamId),
      createdBy: new Types.ObjectId(project.createdBy),
      status: project.status,
      tags: project.tags,
      deadline: project.deadline,
    };
  }
}
