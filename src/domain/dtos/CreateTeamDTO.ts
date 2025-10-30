import { z } from "zod";

/**
 * Validation schema for creating a new team.
 */
export const CreateTeamSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(500).optional(),
  leaderId: z.string().min(1),
  memberIds: z.array(z.string()).default([]),
  projectIds: z.array(z.string()).default([]),
});

/**
 * Strongly typed DTO inferred from {@link CreateTeamSchema}.
 */
export type CreateTeamDTO = z.infer<typeof CreateTeamSchema>;
