import { DocumentType, ReturnModelType } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { CreateTaskDTO } from "@src/domain/dtos/CreateTaskDTO";
import { Task, TaskPriority, TaskStatus } from "@src/domain/entities/Task";
import { ILogger } from "@src/interfaces/Logger";
import { ITaskRepository, UpdateTaskData } from "@src/interfaces/repositories/ITaskRepository";
import { TaskModel, TaskMongoModel } from "@src/infrastructure/database/models/TaskModel";

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

function mapTaskDocument(document: DocumentType<TaskModel>): Task {
  const createdAt = document.get("createdAt") as Date | undefined;
  const updatedAt = document.get("updatedAt") as Date | undefined;

  return new Task({
    id: document._id.toString(),
    title: document.title,
    description: document.description,
    assignedToId: normalizeReference(document.assignedTo),
    projectId: normalizeReference(document.project) ?? "",
    status: document.status as TaskStatus,
    priority: document.priority as TaskPriority,
    dueDate: document.dueDate ?? null,
    createdAt,
    updatedAt,
  });
}

export class TaskRepository implements ITaskRepository {
  constructor(
    private readonly taskModel: ReturnModelType<typeof TaskModel>,
    private readonly logger: ILogger,
  ) {}

  static create(logger: ILogger): TaskRepository {
    return new TaskRepository(TaskMongoModel, logger);
  }

  async create(data: CreateTaskDTO): Promise<Task> {
    try {
      const created = await this.taskModel.create({ ...data });
      this.logger.info("Task created", { taskId: created._id.toString(), projectId: data.projectId });
      return mapTaskDocument(created);
    } catch (error) {
      this.logger.error("Failed to create task", { error });
      throw normalizeError(error);
    }
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const document = await this.taskModel.findById(id).exec();
      return document ? mapTaskDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to find task by id", { id, error });
      throw normalizeError(error);
    }
  }

  async findByProject(projectId: string): Promise<Task[]> {
    try {
      const documents = await this.taskModel.find({ project: projectId }).exec();
      return documents.map(mapTaskDocument);
    } catch (error) {
      this.logger.error("Failed to find tasks by project", { projectId, error });
      throw normalizeError(error);
    }
  }

  async findByAssignee(userId: string): Promise<Task[]> {
    try {
      const documents = await this.taskModel.find({ assignedTo: userId }).exec();
      return documents.map(mapTaskDocument);
    } catch (error) {
      this.logger.error("Failed to find tasks by assignee", { userId, error });
      throw normalizeError(error);
    }
  }

  async update(id: string, updates: UpdateTaskData): Promise<Task | null> {
    try {
      const document = await this.taskModel
        .findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true },
        )
        .exec();

      if (document) {
        this.logger.info("Task updated", { taskId: id });
      }

      return document ? mapTaskDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to update task", { id, updates, error });
      throw normalizeError(error);
    }
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    try {
      const document = await this.taskModel
        .findByIdAndUpdate(
          id,
          {
            $set: { status },
          },
          { new: true },
        )
        .exec();

      if (document) {
        this.logger.info("Task status updated", { taskId: id, status });
      }

      return document ? mapTaskDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to update task status", { id, status, error });
      throw normalizeError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.taskModel.deleteOne({ _id: id }).exec();
      const deleted = result.deletedCount === 1;
      if (deleted) {
        this.logger.warn("Task deleted", { taskId: id });
      }
      return deleted;
    } catch (error) {
      this.logger.error("Failed to delete task", { id, error });
      throw normalizeError(error);
    }
  }
}
