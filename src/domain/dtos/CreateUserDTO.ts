import { z } from "zod";
import { UserRole } from "@src/domain/entities/User";

/**
 * Validation schema for creating a new user.
 */
export const CreateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must contain at least 8 characters"),
  role: z.nativeEnum(UserRole).default(UserRole.DEVELOPER),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  teamIds: z.array(z.string()).default([]),
  projectIds: z.array(z.string()).default([]),
  notificationIds: z.array(z.string()).default([]),
});

/**
 * Strongly typed DTO inferred from {@link CreateUserSchema}.
 */
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
