import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IGetUserByIdUseCase {
  execute(id: string): Promise<User>;
}

export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(id: string): Promise<User> {
    try {
      const user = await this.userRepository.getUserById(id);
      if (!user) {
        this.logger.info(`User with id ${id} not found`);
        throw new DomainError("User not found");
      }
      return user;
    } catch (error) {
      this.logger.error("Error retrieving user by id", { error, userId: id });
      throw new ApplicationError("Could not retrieve user by id");
    }
  }
}
