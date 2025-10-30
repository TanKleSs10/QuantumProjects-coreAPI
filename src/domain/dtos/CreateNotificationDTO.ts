import { z } from "zod";
import { NotificationType } from "@src/domain/entities/Notification";

/**
 * Validation schema for creating a new notification.
 */
export const CreateNotificationSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  message: z.string().trim().min(1, "Message is required"),
  type: z.nativeEnum(NotificationType),
  userId: z.string().min(1),
  read: z.boolean().default(false),
});

/**
 * Strongly typed DTO inferred from {@link CreateNotificationSchema}.
 */
export type CreateNotificationDTO = z.infer<typeof CreateNotificationSchema>;
