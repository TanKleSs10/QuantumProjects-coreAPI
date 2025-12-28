import { z } from "zod";
import { TaskPriorityValue, TaskPriorityValues } from "@src/domain/value-objects/TaskPriority";
import { TaskStatusValue, TaskStatusValues } from "@src/domain/value-objects/TaskStatus";

export const ListTasksByProjectSchema = z.object({
  status: z.enum(TaskStatusValues as readonly TaskStatusValue[]).optional(),
  priority: z.enum(TaskPriorityValues as readonly TaskPriorityValue[]).optional(),
  assigneeId: z.string().min(1).optional(),
});

export type ListTasksByProjectDTO = z.infer<typeof ListTasksByProjectSchema>;
