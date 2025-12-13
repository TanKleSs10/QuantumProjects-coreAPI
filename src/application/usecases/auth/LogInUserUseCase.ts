import { TLogInDTO } from "@src/domain/dtos/LogInDTO";
import { IUserLoginInfo } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

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
      const user = await this.userRepository.getUserByEmail(logInDTO.email);

      if (!user) {
        this.logger.warn("Login attempt with invalid email", { logInDTO });
        throw new DomainError("Invalid credentials");
      }

      const isValidPassword = await this.securityService.verifyPassword(
        logInDTO.password,
        user.password,
      );

      if (!isValidPassword) {
        this.logger.warn("Login attempt with invalid password", { logInDTO });
        throw new DomainError("Invalid credentials");
      }

      if (!user.isVerified) {
        this.logger.warn("Login attempt with unverified email", { logInDTO });
        throw new DomainError("Email is not verified");
      }

      const accessToken = await this.securityService.generateToken(
        { id: user.id },
        "15m",
      );

      const refreshToken = await this.securityService.generateToken(
        { id: user.id },
        "7d",
      );

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
      this.logger.error("Error during user login", { error, logInDTO });
      if (error instanceof DomainError) throw error;
      throw new ApplicationError("Error during login process");
    }
  }
}
