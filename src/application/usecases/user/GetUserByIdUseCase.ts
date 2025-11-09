import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ILogger } from "@src/interfaces/Logger";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IGetUserByIdUseCase {
  execute(id: string): Promise<User>;
}

export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger?: ILogger,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      this.logger?.info(`User with id ${id} not found`);
      throw new DomainError("User not found");
    }
    return user;
  }
}
