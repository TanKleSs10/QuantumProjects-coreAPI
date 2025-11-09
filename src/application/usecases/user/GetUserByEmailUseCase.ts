import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ILogger } from "@src/interfaces/Logger";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IGetUserByEmailUseCase {
  execute(email: string): Promise<User | null>;
}

export class GetUserByEmailUseCase implements IGetUserByEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    public readonly logger?: ILogger,
  ) {}

  async execute(email: string): Promise<User | null> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new DomainError("User not found");
    return user;
  }
}
