import { z } from "zod";

const TeamMembershipSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  role: z.enum(["owner", "admin", "member"] as const),
});

/**
 * Validation schema for creating a new team.
 */
export const CreateTeamSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(500).optional(),
  members: z.array(TeamMembershipSchema).default([]),
  projectIds: z.array(z.string()).default([]),
});

/**
 * Strongly typed DTO inferred from {@link CreateTeamSchema}.
 */
export type CreateTeamDTO = z.infer<typeof CreateTeamSchema>;
export type TeamMembershipDTO = z.infer<typeof TeamMembershipSchema>;
