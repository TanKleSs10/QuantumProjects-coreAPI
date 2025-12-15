import { z } from "zod";

// filepath: c:\Users\diego\OneDrive\Escritorio\devzone\QuantumProjects-coreAPI\src\domain\dtos\UpdateTeamDTO.ts

export const UpdateTeamSchema = z.object({
    name: z.string().trim().min(1, "Name is required").optional(),
    description: z.string().trim().max(500).optional(),
});

export type UpdateTeamDTO = z.infer<typeof UpdateTeamSchema>;