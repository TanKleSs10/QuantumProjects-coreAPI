import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { IEmailService } from "@src/domain/services/IEmailService";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

export interface IForgotPasswordUseCase {
  execute(email: string): Promise<void>;
}

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
  ) {
    this.logger = logger.child("ForgotPasswordUseCase");
  }

  async execute(email: string): Promise<void> {
    try {
      const user = await this.userRepository.getUserByEmail(email);

      if (!user) {
        this.logger.warn("Password reset requested for unknown email", {
          email,
        });
        return;
      }

      const resetToken = await this.securityService.generateToken(
        { id: user.id },
        "reset",
        "1h",
      );

      await this.emailService.sendPasswordResetEmail(user, resetToken);

      this.logger.info("Password reset email sent", { userId: user.id });
    } catch (error) {
      this.logger.error("Failed to send password reset email", {
        error: error instanceof Error ? error.message : String(error),
        email,
      });
      throw new ApplicationError("Failed to send password reset email", {
        cause: error,
      });
    }
  }
}
