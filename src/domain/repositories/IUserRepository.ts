import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { User } from "../entities/User";

export interface IUserRepository {
  createUser(userData: CreateUserDTO): Promise<User>;
  getUserById(id: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(userId: string, updateData: Partial<CreateUserDTO>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
}
