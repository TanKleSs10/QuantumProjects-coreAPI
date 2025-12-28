import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { User } from "@src/domain/entities/User";
import { ILogger } from "@src/interfaces/Logger";
import { DomainError } from "@src/shared/errors/DomainError";
import { InvalidTokenError } from "@src/shared/errors/InvalidTokenError";
import { ExpiredTokenError } from "@src/shared/errors/ExpiredTokenError";
import { lockoutService } from "@src/infrastructure/factories/lockoutServiceFactory";

interface ResetPayload {
  id: string;
}

interface IResetPasswordUseCase {
  execute(token: string, newPassword: string): Promise<User>;
}

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private readonly securityService: ISecurityService,
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(token: string, newPassword: string): Promise<User> {
    if (!token) {
      throw new DomainError("Reset token is required");
    }
    if (!newPassword) {
      throw new DomainError("New password is required");
    }

    const lockKey = `reset:${token}`;
    let payload: ResetPayload | null;
    try {
      payload = await this.securityService.verifyToken<ResetPayload>(
        token,
        "reset",
      );
    } catch (error) {
      if (error instanceof InvalidTokenError || error instanceof ExpiredTokenError) {
        lockoutService.registerFail(lockKey);
      }
      throw error;
    }
    if (!payload) {
      lockoutService.registerFail(lockKey);
      throw new InvalidTokenError();
    }

    const user = await this.userRepository.getUserById(payload.id);
    if (!user) {
      this.logger.warn("User not found during password reset", {
        userId: payload.id,
      });
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

    this.logger.info("User password reset successfully", {
      userId: updatedUser.id,
    });
    lockoutService.clear(lockKey);
    return updatedUser;
  }
}
