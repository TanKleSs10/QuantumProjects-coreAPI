import z from "zod";

export const UpdateProjectSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().max(1000).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
  deadline: z
    .coerce
    .date()
    .refine((d) => d > new Date(), "Deadline must be in the future")
    .optional(),
});

export type UpdateProjectDTO = z.infer<typeof UpdateProjectSchema>;
