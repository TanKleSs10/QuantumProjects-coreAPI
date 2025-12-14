import { z } from "zod";

export const CreateTeamSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().max(500).optional(),
});

export type CreateTeamDTO = z.infer<typeof CreateTeamSchema>;
