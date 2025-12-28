import z from "zod";

export const ResendVerificationSchema = z.object({
  email: z.email("Email must be a valid email address"),
});

export type ResendVerificationDTO = z.infer<typeof ResendVerificationSchema>;
