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
      throw new Error(`Error creating user: ${(error as Error).message}`);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const userFind = await UserMongoModel.findById(id);
      if (!userFind) throw new Error("User not found");
      return User.fromObject(userFind.toObject());
    } catch (error) {
      throw new Error(`Error retrieving user: ${(error as Error).message}`);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await UserMongoModel.find();
      if (!users.length) throw new Error("No users found");
      return users.map((user) => User.fromObject(user.toObject()));
    } catch (error) {
      throw new Error(`Error retrieving users: ${(error as Error).message}`);
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
      if (!userUpdated) throw new Error("User not found");
      return User.fromObject(userUpdated.toObject());
    } catch (error) {
      throw new Error(`Error updating user: ${(error as Error).message}`);
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const userDeleted = await UserMongoModel.findByIdAndDelete(id);
      if (!userDeleted) throw new Error("User not found");
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${(error as Error).message}`);
    }
  }
}
