import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { User } from "@src/domain/entities/User";
import { ILogger } from "@src/interfaces/Logger";
import { DomainError } from "@src/shared/errors/DomainError";
import { InvalidTokenError } from "@src/shared/errors/InvalidTokenError";

interface ResetPayload {
  id: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly securityService: ISecurityService,
    private readonly userRepository: IUserRepository,
    private readonly logger?: ILogger,
  ) {}

  async execute(token: string, newPassword: string): Promise<User> {
    if (!token) {
      throw new DomainError("Reset token is required");
    }
    if (!newPassword) {
      throw new DomainError("New password is required");
    }

    const payload = await this.securityService.verifyToken<ResetPayload>(token);
    if (!payload) {
      throw new InvalidTokenError();
    }

    const user = await this.userRepository.getUserById(payload.id);
    if (!user) {
      this.logger?.warn("User not found during password reset", { userId: payload.id });
      throw new DomainError("User not found");
    }

    const hashedPassword = await this.securityService.hashPassword(newPassword);
    const updatedUser = await this.userRepository.updatePassword(
      user.id,
      hashedPassword,
    );
    if (!updatedUser) {
      throw new DomainError("User not found");
    }

    this.logger?.info("User password reset successfully", { userId: updatedUser.id });
    return updatedUser;
  }
}
