import { z } from "zod";

/**
 * Validation schema for creating a new project.
 */
export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(1000).optional(),
  tags: z
    .array(z.string().trim().min(1).max(50))
    .default([]),
  deadline: z
    .coerce
    .date()
    .refine((d) => d > new Date(), "Deadline must be in the future")
    .optional(),
});

/**
 * Strongly typed DTO inferred from {@link CreateProjectSchema}.
 */
export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;
