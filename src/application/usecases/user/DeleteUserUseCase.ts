import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ILogger } from "@src/interfaces/Logger";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IDeleteUserUseCase {
  execute(id: string): Promise<boolean>;
}

export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(id: string): Promise<boolean> {
    try {
      const deleted = await this.userRepository.deleteUser(id);
      if (!deleted) {
        this.logger.warn(
          `Attempted to delete non-existent user with id: ${id}`,
        );
        throw new DomainError("User not found");
      }
      return true;
    } catch (error) {
      this.logger.error(`Error deleting user with id: ${id}`, { error });
      throw new DomainError("Could not delete user");
    }
  }
}
