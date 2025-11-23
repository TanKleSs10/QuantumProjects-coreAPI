import z from "zod";
import { CreateUserSchema } from "./CreateUserDTO";

/**
 * Validation schema for updating an existing user.
 *
 * - All fields are optional (for partial updates)
 * - Excludes sensitive or immutable fields
 */
export const UpdateUserSchema = CreateUserSchema.partial().extend({
  email: z.email("Email must be a valid email address").optional(),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .optional(),
});

/**
 * Strongly typed DTO inferred from {@link UpdateUserSchema}.
 */
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
