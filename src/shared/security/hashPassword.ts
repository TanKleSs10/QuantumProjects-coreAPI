import bcrypt from "bcrypt";

export const hashPassword = (
  password: string,
  salt: number = 10,
): Promise<string> => {
  return bcrypt.hash(password, salt);
};
