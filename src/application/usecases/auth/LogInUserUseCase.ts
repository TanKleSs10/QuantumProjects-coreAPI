import { TLogInDTO } from "@src/domain/dtos/LogInDTO";
import { IUserLoginInfo, User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { DomainError } from "@src/shared/errors/DomainError";

export interface ILogInUserUseCase {
  execute(
    logInDTO: TLogInDTO,
  ): Promise<{ user: IUserLoginInfo; token: string }>;
}

export class LogInUserUseCase implements ILogInUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
  ) {}

  async execute(
    logInDTO: TLogInDTO,
  ): Promise<{ user: IUserLoginInfo; token: string }> {
    const user = await this.userRepository.getUserByEmail(logInDTO.email);
    if (!user) {
      throw new DomainError("Invalid credentials");
    }

    const isValidPassword = await this.securityService.verifyPassword(
      logInDTO.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new DomainError("Invalid credentials");
    }

    const token = await this.securityService.generateToken(
      { id: user.id },
      "2h",
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }
}
