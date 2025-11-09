import { IUserDatasource } from "@src/domain/datasources/IUserDatasource";
import { CreateUserDTO } from "@src/domain/dtos/CreateUserDTO";
import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { InfrastructureError } from "@src/shared/errors/InfrastructureError";
import { RepositoryError } from "@src/shared/errors/RepositoryError";

export class UserRepository implements IUserRepository {
  constructor(private readonly userDatasource: IUserDatasource) {}

  async createUser(userData: CreateUserDTO): Promise<User> {
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) throw new InfrastructureError("User already exists");

    try {
      const newUser = await this.userDatasource.createUser(userData);
      if (!newUser) throw new RepositoryError("Error creating user");
      return newUser;
    } catch (error) {
      throw new RepositoryError("Error in UserRepository createUser", {
        cause: error,
      });
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await this.userDatasource.getUserById(id);
    } catch (error) {
      if (
        error instanceof InfrastructureError &&
        error.message === "User not found"
      ) {
        return null;
      }
      throw new RepositoryError("Error in UserRepository getUserById", {
        cause: error,
      });
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userDatasource.getUserByEmail(email);
    } catch (error) {
      if (
        error instanceof InfrastructureError &&
        error.message === "User not found"
      ) {
        return null;
      }
      throw new RepositoryError("Error in UserRepository getUserByEmail", {
        cause: error,
      });
    }
  }

  async getAllUsers(): Promise<User[] | []> {
    try {
      return await this.userDatasource.getAllUsers();
    } catch (error) {
      if (
        error instanceof InfrastructureError &&
        error.message === "No users found"
      ) {
        return [];
      }
      throw new RepositoryError("Error in UserRepository getAllUsers", {
        cause: error,
      });
    }
  }

  async updateUser(
    userId: string,
    updateData: Partial<CreateUserDTO>,
  ): Promise<User | null> {
    try {
      return await this.userDatasource.updateUser(userId, updateData);
    } catch (error) {
      if (
        error instanceof InfrastructureError &&
        error.message === "User not found"
      ) {
        return null;
      }
      throw new RepositoryError("Error in UserRepository updateUser", {
        cause: error,
      });
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      return await this.userDatasource.deleteUser(id);
    } catch (error) {
      if (
        error instanceof InfrastructureError &&
        error.message === "User not found"
      ) {
        return false;
      }
      throw new RepositoryError("Error in UserRepository deleteUser", {
        cause: error,
      });
    }
  }
}
