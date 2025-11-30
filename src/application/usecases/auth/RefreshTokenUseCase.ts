import { IUserLoginInfo } from "@src/domain/entities/User";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { DomainError } from "@src/shared/errors/DomainError";

interface RefreshPayload {
  id: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
  ) {}

  async execute(refreshToken: string): Promise<{
    user: IUserLoginInfo;
    accessToken: string;
    refreshToken: string;
  }> {
    if (!refreshToken) {
      throw new DomainError("Refresh token is required");
    }

    const payload = await this.securityService.verifyToken<RefreshPayload>(
      refreshToken,
    );

    if (!payload?.id) {
      throw new DomainError("Invalid refresh token payload");
    }

    const user = await this.userRepository.getUserById(payload.id);
    if (!user) {
      throw new DomainError("User not found");
    }

    if (!user.isVerified) {
      throw new DomainError("Email is not verified");
    }

    const accessToken = await this.securityService.generateToken(
      { id: user.id },
      "15m",
    );

    const rotatedRefreshToken = await this.securityService.generateToken(
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
      refreshToken: rotatedRefreshToken,
    };
  }
}
