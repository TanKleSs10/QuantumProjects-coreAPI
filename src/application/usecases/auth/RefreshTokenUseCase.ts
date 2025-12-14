import { ISecurityService } from "@src/domain/services/ISecurityService";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";

interface IRefreshTokenPayload {
  id: string;
  type: "refresh";
}

interface IRefreshTokenUseCase {
  execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    private readonly securityService: ISecurityService,
    private readonly logger: ILogger,
  ) {
    this.logger = logger.child("RefreshTokenUseCase");
  }

  async execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      if (!refreshToken) {
        this.logger.warn("Refresh token not provided");
        throw new ApplicationError("Refresh token is required");
      }

      // 1. Verificar refresh token (un solo método)
      const payload =
        await this.securityService.verifyToken<IRefreshTokenPayload>(
          refreshToken,
        );

      if (!payload || !payload.id || (payload.type && payload.type !== "refresh")) {
        this.logger.warn("Invalid refresh token");
        throw new ApplicationError("Invalid refresh token");
      }

      const userId = payload.id;

      // 2. Generar nuevo access token
      const newAccessToken = await this.securityService.generateToken(
        { id: userId, type: "access" },
        "15m",
      );

      // 3. Rotar refresh token (sin persistencia, MVP)
      const newRefreshToken = await this.securityService.generateToken(
        { id: userId, type: "refresh" },
        "7d",
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      this.logger.error("Error refreshing token", { error });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError("Invalid or expired refresh token");
    }
  }
}
