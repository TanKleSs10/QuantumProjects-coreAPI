import { z } from "zod";
import { TaskState } from "@src/domain/entities/Task";

/**
 * Validation schema for creating a new task.
 */
export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required").optional(),
  createdBy: z.string().min(1, "Creator is required"),
  assignedToIds: z.array(z.string()).default([]),
  projectId: z.string().min(1),
  state: z.enum(["todo", "doing", "done"] as const satisfies readonly TaskState[]).default("todo"),
});

/**
 * Strongly typed DTO inferred from {@link CreateTaskSchema}.
 */
export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
