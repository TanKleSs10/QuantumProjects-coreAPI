import { TLogInDTO } from "@src/domain/dtos/LogInDTO";
import { IUserLoginInfo } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";
import { lockoutService } from "@src/infrastructure/factories/lockoutServiceFactory";

export interface ILogInUserUseCase {
  execute(logInDTO: TLogInDTO): Promise<{
    user: IUserLoginInfo;
    accessToken: string;
    refreshToken: string;
  }>;
}

export class LogInUserUseCase implements ILogInUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    private readonly logger: ILogger,
  ) {
    this.logger = logger.child("LogInUserUseCase");
  }

  async execute(logInDTO: TLogInDTO): Promise<{
    user: IUserLoginInfo;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const safeLogInContext = { email: logInDTO.email };
      const lockKey = `login:${logInDTO.email}`;

      if (lockoutService.isLocked(lockKey)) {
        this.logger.warn("Login attempt blocked by lockout", safeLogInContext);
        throw new DomainError("Too many attempts");
      }

      const user = await this.userRepository.getUserByEmail(logInDTO.email);

      if (!user) {
        this.logger.warn("Login attempt with invalid email", safeLogInContext);
        lockoutService.registerFail(lockKey);
        throw new DomainError("Invalid credentials");
      }

      const isValidPassword = await this.securityService.verifyPassword(
        logInDTO.password,
        user.password,
      );

      if (!isValidPassword) {
        this.logger.warn("Login attempt with invalid password", safeLogInContext);
        lockoutService.registerFail(lockKey);
        throw new DomainError("Invalid credentials");
      }

      if (!user.isVerified) {
        this.logger.warn(
          "Login attempt with unverified email",
          safeLogInContext,
        );
        throw new DomainError("Email is not verified");
      }

      const accessToken = await this.securityService.generateToken(
        { id: user.id, type: "access" },
        "access",
        "15m",
      );

      const refreshToken = await this.securityService.generateToken(
        { id: user.id, type: "refresh" },
        "refresh",
        "7d",
      );

      lockoutService.clear(lockKey);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error("Error during user login", {
        error: error instanceof Error ? error.message : String(error),
        email: logInDTO?.email,
      });
      if (error instanceof DomainError) throw error;
      throw new ApplicationError("Error during login process");
    }
  }
}
