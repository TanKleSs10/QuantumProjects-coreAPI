import { DocumentType, ReturnModelType } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { CreateProjectDTO } from "@src/domain/dtos/CreateProjectDTO";
import { Project, ProjectStatus } from "@src/domain/entities/Project";
import { ILogger } from "@src/interfaces/Logger";
import { IProjectRepository, UpdateProjectData } from "@src/interfaces/repositories/IProjectRepository";
import { ProjectModel, ProjectMongoModel } from "@src/infrastructure/database/models/ProjectModel";

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function normalizeReference(ref: unknown): string | undefined {
  if (!ref) {
    return undefined;
  }

  if (typeof ref === "string") {
    return ref;
  }

  if (ref instanceof Types.ObjectId) {
    return ref.toString();
  }

  if (typeof ref === "object") {
    const document = ref as { id?: unknown; _id?: unknown };
    if (typeof document.id === "string") {
      return document.id;
    }
    if (document._id instanceof Types.ObjectId) {
      return document._id.toString();
    }
    if (typeof document._id === "string") {
      return document._id;
    }
  }

  return undefined;
}

function normalizeReferences(refs: unknown[]): string[] {
  return refs.map((ref) => normalizeReference(ref)).filter((value): value is string => Boolean(value));
}

function mapProjectDocument(document: DocumentType<ProjectModel>): Project {
  const createdAt = document.get("createdAt") as Date | undefined;
  const updatedAt = document.get("updatedAt") as Date | undefined;

  return new Project({
    id: document._id.toString(),
    title: document.title,
    description: document.description,
    ownerId: normalizeReference(document.owner) ?? "",
    teamId: normalizeReference(document.team),
    taskIds: normalizeReferences(document.tasks ?? []),
    status: document.status as ProjectStatus,
    tags: document.tags ?? [],
    deadline: document.deadline ?? null,
    createdAt,
    updatedAt,
  });
}

export class ProjectRepository implements IProjectRepository {
  constructor(
    private readonly projectModel: ReturnModelType<typeof ProjectModel>,
    private readonly logger: ILogger,
  ) {}

  static create(logger: ILogger): ProjectRepository {
    return new ProjectRepository(ProjectMongoModel, logger);
  }

  async create(data: CreateProjectDTO): Promise<Project> {
    try {
      const created = await this.projectModel.create({ ...data });
      this.logger.info("Project created", { projectId: created._id.toString() });
      return mapProjectDocument(created);
    } catch (error) {
      this.logger.error("Failed to create project", { error });
      throw normalizeError(error);
    }
  }

  async findById(id: string): Promise<Project | null> {
    try {
      const document = await this.projectModel.findById(id).exec();
      return document ? mapProjectDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to find project by id", { id, error });
      throw normalizeError(error);
    }
  }

  async findByOwner(ownerId: string): Promise<Project[]> {
    try {
      const documents = await this.projectModel.find({ owner: ownerId }).exec();
      return documents.map(mapProjectDocument);
    } catch (error) {
      this.logger.error("Failed to find projects by owner", { ownerId, error });
      throw normalizeError(error);
    }
  }

  async findByTeam(teamId: string): Promise<Project[]> {
    try {
      const documents = await this.projectModel.find({ team: teamId }).exec();
      return documents.map(mapProjectDocument);
    } catch (error) {
      this.logger.error("Failed to find projects by team", { teamId, error });
      throw normalizeError(error);
    }
  }

  async listByStatus(status: ProjectStatus): Promise<Project[]> {
    try {
      const documents = await this.projectModel.find({ status }).exec();
      return documents.map(mapProjectDocument);
    } catch (error) {
      this.logger.error("Failed to list projects by status", { status, error });
      throw normalizeError(error);
    }
  }

  async update(id: string, updates: UpdateProjectData): Promise<Project | null> {
    try {
      const document = await this.projectModel
        .findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true },
        )
        .exec();

      if (document) {
        this.logger.info("Project updated", { projectId: id });
      }

      return document ? mapProjectDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to update project", { id, updates, error });
      throw normalizeError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.projectModel.deleteOne({ _id: id }).exec();
      const deleted = result.deletedCount === 1;
      if (deleted) {
        this.logger.warn("Project deleted", { projectId: id });
      }
      return deleted;
    } catch (error) {
      this.logger.error("Failed to delete project", { id, error });
      throw normalizeError(error);
    }
  }
}
