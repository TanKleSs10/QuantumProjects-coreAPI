import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IGetUserByEmailUseCase {
  execute(email: string): Promise<User>;
}

export class GetUserByEmailUseCase implements IGetUserByEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    public readonly logger: ILogger,
  ) {
    this.logger = logger.child("GetUserByEmailUseCase");
  }

  async execute(email: string): Promise<User> {
    try {
      this.logger.debug("Looking for user by email", { email });

      const user = await this.userRepository.getUserByEmail(email);

      if (!user) {
        this.logger.warn("User not found", { email });
        throw new DomainError("User not found");
      }

      this.logger.info("User retrieved successfully", { userId: user.id });
      return user;
    } catch (error: any) {
      if (error instanceof DomainError) {
        throw error; // mantener el error de dominio
      }

      this.logger.error("Repository error retrieving user", {
        error: error instanceof Error ? error.message : String(error),
        email,
      });

      throw new ApplicationError("Could not retrieve user by email", {
        cause: error,
      });
    }
  }
}
