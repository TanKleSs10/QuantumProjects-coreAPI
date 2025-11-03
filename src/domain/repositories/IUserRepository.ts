import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { User } from "../entities/User";

export interface IUserRepository {
  createUser(userData: CreateUserDTO): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  updateUser(userId: string, updateData: Partial<CreateUserDTO>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
}
