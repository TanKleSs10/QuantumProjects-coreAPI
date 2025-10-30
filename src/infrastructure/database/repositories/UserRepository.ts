import { ReturnModelType, DocumentType } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { CreateUserDTO } from "@src/domain/dtos/CreateUserDTO";
import { User, UserRole } from "@src/domain/entities/User";
import { ILogger } from "@src/interfaces/Logger";
import { IUserRepository, UpdateUserData } from "@src/interfaces/repositories/IUserRepository";
import { UserModel, UserMongoModel } from "@src/infrastructure/database/models/UserModel";

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

function mapUserDocument(document: DocumentType<UserModel>): User {
  const createdAt = document.get("createdAt") as Date | undefined;
  const updatedAt = document.get("updatedAt") as Date | undefined;

  return new User({
    id: document._id.toString(),
    name: document.name,
    email: document.email,
    passwordHash: document.password,
    role: document.role as UserRole,
    avatarUrl: document.avatarUrl,
    bio: document.bio,
    teamIds: normalizeReferences(document.teams ?? []),
    projectIds: normalizeReferences(document.projects ?? []),
    notificationIds: normalizeReferences(document.notifications ?? []),
    createdAt,
    updatedAt,
  });
}

export class UserRepository implements IUserRepository {
  constructor(
    private readonly userModel: ReturnModelType<typeof UserModel>,
    private readonly logger: ILogger,
  ) {}

  static create(logger: ILogger): UserRepository {
    return new UserRepository(UserMongoModel, logger);
  }

  async create(data: CreateUserDTO): Promise<User> {
    try {
      const created = await this.userModel.create({
        ...data,
      });
      this.logger.info("User created", { userId: created._id.toString() });
      return mapUserDocument(created);
    } catch (error) {
      this.logger.error("Failed to create user", { error });
      throw normalizeError(error);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const document = await this.userModel.findById(id).exec();
      return document ? mapUserDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to find user by id", { id, error });
      throw normalizeError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const document = await this.userModel.findOne({ email }).exec();
      return document ? mapUserDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to find user by email", { email, error });
      throw normalizeError(error);
    }
  }

  async list(): Promise<User[]> {
    try {
      const documents = await this.userModel.find().exec();
      return documents.map(mapUserDocument);
    } catch (error) {
      this.logger.error("Failed to list users", { error });
      throw normalizeError(error);
    }
  }

  async update(id: string, updates: UpdateUserData): Promise<User | null> {
    try {
      const document = await this.userModel
        .findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true },
        )
        .exec();

      if (document) {
        this.logger.info("User updated", { userId: id });
      }

      return document ? mapUserDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to update user", { id, updates, error });
      throw normalizeError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.userModel.deleteOne({ _id: id }).exec();
      const deleted = result.deletedCount === 1;
      if (deleted) {
        this.logger.warn("User deleted", { userId: id });
      }
      return deleted;
    } catch (error) {
      this.logger.error("Failed to delete user", { id, error });
      throw normalizeError(error);
    }
  }
}
