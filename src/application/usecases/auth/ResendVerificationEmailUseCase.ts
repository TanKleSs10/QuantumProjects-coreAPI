import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { IEmailService } from "@src/domain/services/IEmailService";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

export interface IResendVerificationEmailUseCase {
  execute(email: string): Promise<void>;
}

export class ResendVerificationEmailUseCase
  implements IResendVerificationEmailUseCase
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
  ) {
    this.logger = logger.child("ResendVerificationEmailUseCase");
  }

  async execute(email: string): Promise<void> {
    try {
      const user = await this.userRepository.getUserByEmail(email);

      if (!user) {
        this.logger.warn("Verification resend requested for unknown email", {
          email,
        });
        return;
      }

      if (user.isVerified) {
        this.logger.info("Verification resend requested for verified user", {
          userId: user.id,
        });
        return;
      }

      const verificationToken = await this.securityService.generateToken(
        { id: user.id },
        "verify",
        "1h",
      );

      await this.emailService.sendVerificationEmail(user, verificationToken);

      this.logger.info("Verification email resent", { userId: user.id });
    } catch (error) {
      this.logger.error("Failed to resend verification email", {
        error: error instanceof Error ? error.message : String(error),
        email,
      });
      throw new ApplicationError("Failed to resend verification email", {
        cause: error,
      });
    }
  }
}
