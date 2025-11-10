import { User } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { DomainError } from "@src/shared/errors/DomainError";

export interface ILoginUserUseCase {
  execute(email: string, password: string): Promise<{ user: User; token: string }>;
}

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
  ) {}

  async execute(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new DomainError("Invalid credentials");
    }

    const isValidPassword = await this.securityService.verifyPassword(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw new DomainError("Invalid credentials");
    }

    const token = await this.securityService.generateToken(
      { id: user.id, role: user.role },
      "12h",
    );

    return { user, token };
  }
}
