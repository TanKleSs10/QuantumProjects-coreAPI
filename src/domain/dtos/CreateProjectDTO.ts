import { z } from "zod";
import { ProjectStatus } from "@src/domain/entities/Project";

/**
 * Validation schema for creating a new project.
 */
export const CreateProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  ownerId: z.string().min(1),
  teamId: z.string().min(1).optional(),
  taskIds: z.array(z.string()).default([]),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ACTIVE),
  tags: z.array(z.string()).default([]),
  deadline: z.coerce.date().optional(),
});

/**
 * Strongly typed DTO inferred from {@link CreateProjectSchema}.
 */
export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;
