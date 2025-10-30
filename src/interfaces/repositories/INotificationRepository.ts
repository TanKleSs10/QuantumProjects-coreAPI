import { CreateNotificationDTO } from "@src/domain/dtos/CreateNotificationDTO";
import { Notification } from "@src/domain/entities/Notification";

/**
 * Fields allowed to be updated on an existing notification.
 */
export type UpdateNotificationData = Partial<CreateNotificationDTO>;

/**
 * Contract that must be implemented by any persistence mechanism handling notifications.
 */
export interface INotificationRepository {
  /**
   * Persists a new notification targeted to a user.
   */
  create(data: CreateNotificationDTO): Promise<Notification>;

  /**
   * Retrieves a notification by its identifier.
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Lists notifications for a given user.
   */
  findByUser(userId: string): Promise<Notification[]>;

  /**
   * Marks a notification as read and returns the updated entity.
   */
  markAsRead(id: string): Promise<Notification | null>;

  /**
   * Updates the notification payload.
   */
  update(id: string, updates: UpdateNotificationData): Promise<Notification | null>;

  /**
   * Deletes a notification.
   */
  delete(id: string): Promise<boolean>;
}
