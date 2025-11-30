import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

export interface IGetAllUsersUseCase {
  execute(): Promise<User[] | []>;
}

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {
    this.logger = logger.child("GetAllUsersUseCase");
  }

  async execute(): Promise<User[] | []> {
    try {
      const users = await this.userRepository.getAllUsers();

      if (users === null) {
        this.logger.error("User repository returned null");
        throw new ApplicationError("Could not retrieve users");
      }

      if (!users.length) {
        this.logger.info("No users found");
        return [];
      }

      this.logger.info("Users retrieved successfully", {
        count: users.length,
      });

      return users;
    } catch (error: any) {
      this.logger.error("Failed to get all users", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to retrieve users", {
        cause: error,
      });
    }
  }
}
