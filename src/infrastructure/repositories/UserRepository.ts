import { IUserDatasource } from "@src/domain/datasources/IUserDatasource";
import { CreateUserDTO } from "@src/domain/dtos/CreateUserDTO";
import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { InfrastructureError } from "@src/shared/errors/InfrastructureError";
import { RepositoryError } from "@src/shared/errors/RepositoryError";

export class UserRepository implements IUserRepository {
  constructor(private readonly userDatasource: IUserDatasource) {}

  async createUser(userData: CreateUserDTO): Promise<User> {
    try {
      const userExists = await this.userDatasource.getUserByEmail(
        userData.email,
      );
      if (userExists) throw new InfrastructureError("User already exists");
      const newUser = await this.userDatasource.createUser(userData);
      if (!newUser) throw new RepositoryError("Error creating user");
      return newUser;
    } catch (error) {
      throw new RepositoryError("Error in UserRepository createUser", {
        cause: error,
      });
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const userFind = await this.userDatasource.getUserById(id);
      if (!userFind) throw new RepositoryError("User not found");
      return userFind;
    } catch (error) {
      throw new RepositoryError("Error in UserRepository getUserById", {
        cause: error,
      });
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await this.userDatasource.getAllUsers();
      if (!users.length) throw new RepositoryError("No users found");
      return users;
    } catch (error) {
      throw new RepositoryError("Error in UserRepository getAllUsers", {
        cause: error,
      });
    }
  }

  async updateUser(
    userId: string,
    updateData: Partial<CreateUserDTO>,
  ): Promise<User> {
    try {
      const userUpdated = await this.userDatasource.updateUser(
        userId,
        updateData,
      );
      if (!userUpdated) throw new RepositoryError("Error updating user");
      return userUpdated;
    } catch (error) {
      throw new RepositoryError("Error in UserRepository updateUser", {
        cause: error,
      });
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.userDatasource.deleteUser(id);
      if (!result) throw new RepositoryError("Error deleting user");
      return result;
    } catch (error) {
      throw new RepositoryError("Error in UserRepository deleteUser", {
        cause: error,
      });
    }
  }
}
