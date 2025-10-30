/**
 * Enumeration of notification categories supported by the platform.
 */
export enum NotificationType {
  TASK = "task",
  PROJECT = "project",
  SYSTEM = "system",
}

/**
 * Properties required to create a {@link Notification} domain entity.
 */
export interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
  read?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain representation of a notification targeted to a user.
 */
export class Notification {
  public readonly id: string;
  public title: string;
  public message: string;
  public type: NotificationType;
  public userId: string;
  public read: boolean;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: NotificationProps) {
    this.id = props.id;
    this.title = props.title;
    this.message = props.message;
    this.type = props.type;
    this.userId = props.userId;
    this.read = props.read ?? false;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
