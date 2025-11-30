import { ISecurityService } from "@src/domain/services/ISecurityService";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

interface IRefreshTokenUseCase {
  execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(private readonly securityService: ISecurityService) {}

  async execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!refreshToken) {
      throw new ApplicationError("Refresh token is required");
    }

    // 1. Verificar refresh token
    const payload = await this.securityService.verifyToken<{ id: string }>(
      refreshToken,
    );

    if (!payload || !payload.id) {
      throw new ApplicationError("Invalid refresh token");
    }

    const userId = payload.id; // 🔥 viene del token, no del cliente

    // 2. Generar access token nuevo
    const newAccessToken = await this.securityService.generateToken(
      { id: userId },
      "15m",
    );

    // 3. Generar refresh token nuevo (rotación segura)
    const newRefreshToken = await this.securityService.generateToken(
      { id: userId },
      "7d",
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
