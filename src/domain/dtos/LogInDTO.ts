import { z } from "zod";

import { CreateUserSchema } from "./CreateUserDTO";

export const LogInSchema = CreateUserSchema.pick({
  email: true,
  password: true,
});

export type TLogInDTO = z.infer<typeof LogInSchema>;
