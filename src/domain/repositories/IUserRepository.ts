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
  ): Promise<User>;
  verifyUser(userId: string): Promise<User>;
  updatePassword(userId: string, passwordHash: string): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
}
