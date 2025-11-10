import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { User } from "../entities/User";

export interface IUserDatasource {
  createUser(userData: CreateUserDTO): Promise<User>;
  getUserById(userId: string): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
  getAllUsers(): Promise<User[] | []>;
  updateUser(userId: string, userData: Partial<CreateUserDTO>): Promise<User>;
  markUserAsVerified(userId: string): Promise<User>;
  updatePassword(userId: string, passwordHash: string): Promise<User>;
  deleteUser(userId: string): Promise<boolean>;
}
