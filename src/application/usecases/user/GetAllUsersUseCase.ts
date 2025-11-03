import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ILogger } from "@src/interfaces/Logger";

export interface IGetAllUsersUseCase {
  execute(): Promise<User[]>;
}

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger?: ILogger,
  ) {}

  async execute(): Promise<User[]> {
    const users = await this.userRepository.getAllUsers();

    if (!users.length) {
      this.logger?.info("No users found in repository");
      return [];
    }

    this.logger?.info("Users retrieved successfully", { count: users.length });
    return users;
  }
}
