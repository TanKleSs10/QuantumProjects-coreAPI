import { z } from "zod";
import { TaskPriorityValue, TaskPriorityValues } from "@src/domain/value-objects/TaskPriority";
import { TaskStatusValue, TaskStatusValues } from "@src/domain/value-objects/TaskStatus";

/**
 * Validation schema for creating a new task.
 */
export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required").optional(),
  status: z.enum(TaskStatusValues as readonly TaskStatusValue[]).default("todo"),
  priority: z.enum(TaskPriorityValues as readonly TaskPriorityValue[]).default("medium"),
  assigneeId: z.string().min(1).optional(),
  dueDate: z.coerce.date().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

/**
 * Strongly typed DTO inferred from {@link CreateTaskSchema}.
 */
export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
