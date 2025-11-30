import { CreateUserDTO } from "@src/domain/dtos/CreateUserDTO";
import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { IEmailService } from "@src/domain/services/IEmailService";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

export interface ICreateUserUseCase {
  excecute(userData: CreateUserDTO): Promise<User>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    private readonly emailService: IEmailService,
    private readonly logger?: ILogger,
  ) {
    this.logger = logger?.child("CreateUserUseCase");
  }

  async excecute(userData: CreateUserDTO): Promise<User> {
    try {
      this.logger?.debug("Starting user creation process", { userData });

      const passwordHashed = await this.securityService.hashPassword(
        userData.password,
      );

      this.logger?.debug("Password hashed successfully");

      const userDataWithHashedPassword = {
        ...userData,
        password: passwordHashed,
      };

      const user = await this.userRepository.createUser(
        userDataWithHashedPassword,
      );

      this.logger?.info("User created successfully", { userId: user.id });

      // 📧 3. Generate verification token
      const verificationToken = await this.securityService.generateToken(
        { id: user.id },
        "1h",
      );

      this.logger?.debug("Verification token generated");

      await this.emailService.sendVerificationEmail(user, verificationToken);

      this.logger?.info("Verification email sent", {
        email: user.email,
        userId: user.id,
      });

      return user;
    } catch (error: any) {
      this.logger?.error("User creation failed", {
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError("Failed to create user", {
        cause: error,
      });
    }
  }
}
