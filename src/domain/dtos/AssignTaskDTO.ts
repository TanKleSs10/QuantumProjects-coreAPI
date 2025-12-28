import { z } from "zod";

export const AssignTaskSchema = z.object({
  assigneeId: z.string().min(1, "Assignee is required"),
});

export type AssignTaskDTO = z.infer<typeof AssignTaskSchema>;
