import { DocumentType, ReturnModelType } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { CreateNotificationDTO } from "@src/domain/dtos/CreateNotificationDTO";
import { Notification, NotificationType } from "@src/domain/entities/Notification";
import { ILogger } from "@src/interfaces/Logger";
import {
  INotificationRepository,
  UpdateNotificationData,
} from "@src/interfaces/repositories/INotificationRepository";
import {
  NotificationModel,
  NotificationMongoModel,
} from "@src/infrastructure/database/models/NotificationModel";

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

function mapNotificationDocument(document: DocumentType<NotificationModel>): Notification {
  const createdAt = document.get("createdAt") as Date | undefined;
  const updatedAt = document.get("updatedAt") as Date | undefined;

  return new Notification({
    id: document._id.toString(),
    title: document.title,
    message: document.message,
    type: document.type as NotificationType,
    userId: normalizeReference(document.user) ?? "",
    read: document.read,
    createdAt,
    updatedAt,
  });
}

export class NotificationRepository implements INotificationRepository {
  constructor(
    private readonly notificationModel: ReturnModelType<typeof NotificationModel>,
    private readonly logger: ILogger,
  ) {}

  static create(logger: ILogger): NotificationRepository {
    return new NotificationRepository(NotificationMongoModel, logger);
  }

  async create(data: CreateNotificationDTO): Promise<Notification> {
    try {
      const created = await this.notificationModel.create({ ...data });
      this.logger.info("Notification created", { notificationId: created._id.toString(), userId: data.userId });
      return mapNotificationDocument(created);
    } catch (error) {
      this.logger.error("Failed to create notification", { error });
      throw normalizeError(error);
    }
  }

  async findById(id: string): Promise<Notification | null> {
    try {
      const document = await this.notificationModel.findById(id).exec();
      return document ? mapNotificationDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to find notification by id", { id, error });
      throw normalizeError(error);
    }
  }

  async findByUser(userId: string): Promise<Notification[]> {
    try {
      const documents = await this.notificationModel.find({ user: userId }).sort({ createdAt: -1 }).exec();
      return documents.map(mapNotificationDocument);
    } catch (error) {
      this.logger.error("Failed to find notifications by user", { userId, error });
      throw normalizeError(error);
    }
  }

  async markAsRead(id: string): Promise<Notification | null> {
    try {
      const document = await this.notificationModel
        .findByIdAndUpdate(
          id,
          {
            $set: { read: true },
          },
          { new: true },
        )
        .exec();

      if (document) {
        this.logger.info("Notification marked as read", { notificationId: id });
      }

      return document ? mapNotificationDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to mark notification as read", { id, error });
      throw normalizeError(error);
    }
  }

  async update(id: string, updates: UpdateNotificationData): Promise<Notification | null> {
    try {
      const document = await this.notificationModel
        .findByIdAndUpdate(
          id,
          {
            $set: updates,
          },
          { new: true },
        )
        .exec();

      if (document) {
        this.logger.info("Notification updated", { notificationId: id });
      }

      return document ? mapNotificationDocument(document) : null;
    } catch (error) {
      this.logger.error("Failed to update notification", { id, updates, error });
      throw normalizeError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.notificationModel.deleteOne({ _id: id }).exec();
      const deleted = result.deletedCount === 1;
      if (deleted) {
        this.logger.warn("Notification deleted", { notificationId: id });
      }
      return deleted;
    } catch (error) {
      this.logger.error("Failed to delete notification", { id, error });
      throw normalizeError(error);
    }
  }
}
