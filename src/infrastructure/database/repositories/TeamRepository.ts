import { DocumentType, ReturnModelType } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { CreateTeamDTO } from "@src/domain/dtos/CreateTeamDTO";
import { Team } from "@src/domain/entities/Team";
import { ILogger } from "@src/interfaces/Logger";
import { ITeamRepository, UpdateTeamData } from "@src/interfaces/repositories/ITeamRepository";
import { TeamModel, TeamMongoModel } from "@src/infrastructure/database/models/TeamModel";

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

function mapTeamDocument(document: DocumentType<TeamModel>): Team {
  const createdAt = document.get("createdAt") as Date | undefined;
  const updatedAt = document.get("updatedAt") as Date | undefined;

  return new Team({
    id: document._id.toString(),
    name: document.name,
    description: document.description,
    leaderId: normalizeReference(document.leader) ?? "",
    memberIds: normalizeReferences(document.members ?? []),
    projectIds: normalizeReferences(document.projects ?? []),
    createdAt,
    updatedAt,
  });
}

export class TeamRepository implements ITeamRepository {
  constructor(
    private readonly teamModel: ReturnModelType<typeof TeamModel>,
    private readonly logger: ILogger,
  ) {}

  static create(logger: ILogger): TeamRepository {
    return new TeamRepository(TeamMongoModel, logger);
  }

  async create(data: CreateTeamDTO): Promise<Team> {
    try {
      const created = await this.teamModel.create({ ...data });
      this.logger.info("Team created", { teamId: created._id.toString(), leaderId: data.leaderId });
      return mapTeamDocument(created);
    } catch (error) {
      this.logger.error("Failed to create team", { error });
      throw normalizeError(error);
    }
  }

  async findById(id: string): Promise<Team | null> {
    try {
      const document = await this.teamModel.findById(id).exec();
      return document ? mapTeamDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to find team by id", { id, error });
      throw normalizeError(error);
    }
  }

  async findByLeader(leaderId: string): Promise<Team[]> {
    try {
      const documents = await this.teamModel.find({ leader: leaderId }).exec();
      return documents.map(mapTeamDocument);
    } catch (error) {
      this.logger.error("Failed to find teams by leader", { leaderId, error });
      throw normalizeError(error);
    }
  }

  async findByMember(userId: string): Promise<Team[]> {
    try {
      const documents = await this.teamModel.find({ members: userId }).exec();
      return documents.map(mapTeamDocument);
    } catch (error) {
      this.logger.error("Failed to find teams by member", { userId, error });
      throw normalizeError(error);
    }
  }

  async update(id: string, updates: UpdateTeamData): Promise<Team | null> {
    try {
      const document = await this.teamModel
        .findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true },
        )
        .exec();

      if (document) {
        this.logger.info("Team updated", { teamId: id });
      }

      return document ? mapTeamDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to update team", { id, updates, error });
      throw normalizeError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.teamModel.deleteOne({ _id: id }).exec();
      const deleted = result.deletedCount === 1;
      if (deleted) {
        this.logger.warn("Team deleted", { teamId: id });
      }
      return deleted;
    } catch (error) {
      this.logger.error("Failed to delete team", { id, error });
      throw normalizeError(error);
    }
  }
}
