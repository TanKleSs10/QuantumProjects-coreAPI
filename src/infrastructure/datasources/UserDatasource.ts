import { InfrastructureError } from "@src/shared/errors/InfrastructureError";
import { CreateUserDTO } from "@src/domain/dtos/CreateUserDTO";
import { UserMongoModel } from "../database/models/UserModel";
import { User } from "@src/domain/entities/User";
import { IUserDatasource } from "@src/domain/datasources/IUserDatasource";

export class UserDatasource implements IUserDatasource {
  async createUser(userData: CreateUserDTO): Promise<User> {
    try {
      const newUser = await UserMongoModel.create(userData);
      return User.fromObject(newUser.toObject());
    } catch (error) {
      if (error instanceof InfrastructureError) {
        throw error;
      }
      throw new InfrastructureError("Error creating user", { cause: error });
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const userFind = await UserMongoModel.findById(id);
      if (!userFind) {
        throw new InfrastructureError("User not found");
      }
      return User.fromObject(userFind.toObject());
    } catch (error) {
      if (error instanceof InfrastructureError) {
        throw error;
      }
      throw new InfrastructureError("Error retrieving user by id", { cause: error });
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const userFind = await UserMongoModel.findOne({ email });
      if (!userFind) {
        throw new InfrastructureError("User not found");
      }
      return User.fromObject(userFind.toObject());
    } catch (error) {
      if (error instanceof InfrastructureError) {
        throw error;
      }
      throw new InfrastructureError("Error retrieving user by email", { cause: error });
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await UserMongoModel.find();
      if (!users.length) {
        throw new InfrastructureError("No users found");
      }
      return users.map((user) => User.fromObject(user.toObject()));
    } catch (error) {
      if (error instanceof InfrastructureError) {
        throw error;
      }
      throw new InfrastructureError("Error retrieving users", { cause: error });
    }
  }

  async updateUser(
    id: string,
    updateData: Partial<CreateUserDTO>,
  ): Promise<User> {
    try {
      const userUpdated = await UserMongoModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true },
      );
      if (!userUpdated) {
        throw new InfrastructureError("User not found");
      }
      return User.fromObject(userUpdated.toObject());
    } catch (error) {
      if (error instanceof InfrastructureError) {
        throw error;
      }
      throw new InfrastructureError("Error updating user", { cause: error });
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const userDeleted = await UserMongoModel.findByIdAndDelete(id);
      if (!userDeleted) {
        throw new InfrastructureError("User not found");
      }
      return true;
    } catch (error) {
      if (error instanceof InfrastructureError) {
        throw error;
      }
      throw new InfrastructureError("Error deleting user", { cause: error });
    }
  }
}
