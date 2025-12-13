import { CreateUserDTO } from "@src/domain/dtos/CreateUserDTO";
import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { DomainError } from "@src/shared/errors/DomainError";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { ILogger } from "@src/interfaces/Logger";

export interface IUpdateUserUseCase {
  execute(id: string, data: Partial<CreateUserDTO>): Promise<User>;
}

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    private readonly logger: ILogger,
  ) {
    this.logger = logger.child("UpdateUserUseCase");
  }

  async execute(id: string, data: Partial<CreateUserDTO>): Promise<User> {
    try {
      this.logger.debug("Updating user", { userId: id, data });

      const updatePayload: Partial<CreateUserDTO> = { ...data };

      // 🔐 Si viene contraseña → hashear antes de guardar
      if (data.password) {
        this.logger.debug("Hashing new password for user", { userId: id });

        const hashedPassword = await this.securityService.hashPassword(
          data.password,
        );

        updatePayload.password = hashedPassword;
      }

      // 🗄 Actualizar usuario en el repositorio
      const updatedUser = await this.userRepository.updateUser(
        id,
        updatePayload,
      );

      if (!updatedUser) {
        this.logger.warn("User not found for update", { userId: id });
        throw new DomainError("User not found");
      }

      this.logger.info("User updated successfully", { userId: id });
      return updatedUser;
    } catch (error: any) {
      // Mantener DomainError
      if (error instanceof DomainError) throw error;

      this.logger.error("Failed to update user", {
        userId: id,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Could not update user", { cause: error });
    }
  }
}
