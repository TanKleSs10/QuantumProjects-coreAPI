import { ChangePassDTO } from "@src/domain/dtos/ChangePassDTO";
import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { ILogger } from "@src/interfaces/Logger";
import { DomainError } from "@src/shared/errors/DomainError";

interface IChangePassUseCase {
  execute(changePassDTO: ChangePassDTO): Promise<User>;
}

export class ChangePassUseCase implements IChangePassUseCase {
  private readonly logger?: ILogger;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    logger?: ILogger,
  ) {
    this.logger = logger?.child("ChangePassUseCase");
  }

  async execute(changePassDTO: ChangePassDTO): Promise<User> {
    try {
      const { userId, currentPassword, password: newPassword } = changePassDTO;

      this.logger?.info("Starting password change process", { userId });

      // 1. Validate user exists
      const user = await this.userRepository.getUserById(userId);

      if (!user) {
        this.logger?.warn("User not found for password change", { userId });
        throw new DomainError("User does not exist");
      }

      // 2. Verify current password
      const isValidPassword = await this.securityService.verifyPassword(
        currentPassword,
        user.password,
      );

      if (!isValidPassword) {
        this.logger?.warn("Incorrect current password", { userId });
        throw new DomainError("Current password is incorrect");
      }

      // 3. Prevent using the same password
      const isSamePassword = await this.securityService.verifyPassword(
        newPassword,
        user.password,
      );

      if (isSamePassword) {
        this.logger?.warn("Attempt to reuse old password", { userId });
        throw new DomainError(
          "New password cannot be the same as old password",
        );
      }

      // 4. Hash new password
      const hashedPassword =
        await this.securityService.hashPassword(newPassword);

      // 5. Update password
      const updatedUser = await this.userRepository.updatePassword(
        userId,
        hashedPassword,
      );

      if (!updatedUser) {
        this.logger?.error("Failed to update password", { userId });
        throw new DomainError("Could not update password");
      }

      this.logger?.info("Password updated successfully", { userId });
      return updatedUser;
    } catch (error) {
      this.logger?.error("Unexpected error updating password", { error });
      throw error instanceof Error
        ? error
        : new DomainError("Unexpected error updating password");
    }
  }
}
