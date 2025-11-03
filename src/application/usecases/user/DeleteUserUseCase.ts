import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IDeleteUserUseCase {
  execute(id: string): Promise<boolean>;
}

export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<boolean> {
    const deleted = await this.userRepository.deleteUser(id);
    if (!deleted) {
      throw new DomainError("User not found");
    }
    return true;
  }
}
