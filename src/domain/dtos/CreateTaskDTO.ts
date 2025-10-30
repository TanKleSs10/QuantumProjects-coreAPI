import { z } from "zod";
import { TaskPriority, TaskStatus } from "@src/domain/entities/Task";

/**
 * Validation schema for creating a new task.
 */
export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  assignedToId: z.string().min(1).optional(),
  projectId: z.string().min(1),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.coerce.date().optional(),
});

/**
 * Strongly typed DTO inferred from {@link CreateTaskSchema}.
 */
export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
