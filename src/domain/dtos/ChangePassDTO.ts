import z from "zod";

export const ChangePassSchema = z.object({
  userId: z.string(),
  currentPassword: z
    .string()
    .min(8, "Current password must contain at least 8 characters"),
  newPassword: z
    .string()
    .min(8, "New password must contain at least 8 characters"),
});

export type ChangePassDTO = z.infer<typeof ChangePassSchema>;
