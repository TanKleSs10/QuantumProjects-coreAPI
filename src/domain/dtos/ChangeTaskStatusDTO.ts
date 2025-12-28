import { z } from "zod";
import { TaskStatusValue, TaskStatusValues } from "@src/domain/value-objects/TaskStatus";

export const ChangeTaskStatusSchema = z.object({
  status: z.enum(TaskStatusValues as readonly TaskStatusValue[]),
});

export type ChangeTaskStatusDTO = z.infer<typeof ChangeTaskStatusSchema>;
