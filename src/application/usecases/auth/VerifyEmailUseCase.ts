import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { User } from "@src/domain/entities/User";
import { ILogger } from "@src/interfaces/Logger";
import { DomainError } from "@src/shared/errors/DomainError";
import { InvalidTokenError } from "@src/shared/errors/InvalidTokenError";

interface VerificationPayload {
  id: string;
}

export class VerifyEmailUseCase {
  constructor(
    private readonly securityService: ISecurityService,
    private readonly userRepository: IUserRepository,
    private readonly logger?: ILogger,
  ) {}

  async execute(token: string): Promise<User> {
    if (!token) {
      throw new DomainError("Verification token is required");
    }

    const payload = await this.securityService.verifyToken<VerificationPayload>(token);
    if (!payload) {
      throw new InvalidTokenError();
    }

    const user = await this.userRepository.getUserById(payload.id);
    if (!user) {
      this.logger?.warn("User not found during email verification", {
        userId: payload.id,
      });
      throw new DomainError("User not found");
    }

    if (user.isVerified) {
      this.logger?.info("User already verified", { userId: user.id });
      return user;
    }

    const verifiedUser = await this.userRepository.verifyUser(user.id);
    if (!verifiedUser) {
      throw new DomainError("User not found");
    }

    this.logger?.info("User verified successfully", { userId: verifiedUser.id });
    return verifiedUser;
  }
}
