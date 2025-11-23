import z from "zod";

/**
 * Validation schema for creating a new user.
 */
export const CreateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Email must be a valid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  avatarUrl: z.url().optional(),
  bio: z.string().max(500).optional(),
  teamIds: z.array(z.string()).default([]),
  projectIds: z.array(z.string()).default([]),
  notificationIds: z.array(z.string()).default([]),
});

/**
 * Strongly typed DTO inferred from {@link CreateUserSchema}.
 */
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
