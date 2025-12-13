import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { User } from "../entities/User";

export interface IUserRepository {
  createUser(userData: CreateUserDTO): Promise<User>;
  getUserById(id: string): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(
    userId: string,
    updateData: Partial<CreateUserDTO>,
<<<<<<< HEAD
  ): Promise<User>;
  verifyUser(userId: string): Promise<User>;
=======
  ): Promise<User | null>;
  verifyUser(userId: string): Promise<User | null>;
>>>>>>> 6283d2a (feat: add change password functionality)
  updatePassword(userId: string, passwordHash: string): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
}
