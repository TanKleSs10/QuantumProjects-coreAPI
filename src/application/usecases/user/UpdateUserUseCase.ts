import { CreateUserDTO } from "@src/domain/dtos/CreateUserDTO";
import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IUpdateUserUseCase {
  execute(id: string, data: Partial<CreateUserDTO>): Promise<User>;
}

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
  ) {}

  async execute(id: string, data: Partial<CreateUserDTO>): Promise<User> {
    const updatePayload: Partial<CreateUserDTO> & { passwordHash?: string } = {
      ...data,
    };

    if (data.password) {
      const hashedPassword = await this.securityService.hashPassword(data.password);
      updatePayload.passwordHash = hashedPassword;
      delete updatePayload.password;
    }

    const updatedUser = await this.userRepository.updateUser(id, updatePayload);
    if (!updatedUser) {
      throw new DomainError("User not found");
    }

    return updatedUser;
  }
}
