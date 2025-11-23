import { z } from "zod";
import { ProjectStatus } from "@src/domain/entities/Project";

/**
 * Validation schema for creating a new project.
 */
export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(1000).optional(),
  createdBy: z.string().min(1, "Creator is required"),
  teamId: z.string().min(1),
  taskIds: z.array(z.string()).default([]),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ACTIVE),
  tags: z.array(z.string()).default([]),
  deadline: z.coerce.date().optional(),
});

/**
 * Strongly typed DTO inferred from {@link CreateProjectSchema}.
 */
export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;
