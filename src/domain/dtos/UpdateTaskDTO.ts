import { z } from "zod";
import { TaskPriorityValue, TaskPriorityValues } from "@src/domain/value-objects/TaskPriority";

export const UpdateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(TaskPriorityValues as readonly TaskPriorityValue[]).optional(),
  dueDate: z.coerce.date().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>;
