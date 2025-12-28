import jwt, { JsonWebTokenError, TokenExpiredError, SignOptions } from "jsonwebtoken";

import { ITokenAdapter } from "@src/domain/ports/ITokenAdapter";
import { envs } from "@src/config/envs";
import { logger } from "@src/infrastructure/logs";
import { InvalidTokenError } from "@src/shared/errors/InvalidTokenError";
import { ExpiredTokenError } from "@src/shared/errors/ExpiredTokenError";
import { TokenType } from "@src/types/tokenType";

export class JWTAdapter implements ITokenAdapter {
  private readonly defaultExpiresIn = envs.JWT_EXPIRES_IN;
  private readonly log = logger.child("JWTAdapter");
  private readonly secrets: Record<TokenType, string> = {
    access: envs.JWT_SECRET,
    refresh: envs.REFRESH_JWT_SECRET,
    verify: envs.VERIFY_JWT_SECRET,
    reset: envs.RESET_JWT_SECRET,
  };

  generateToken(
    payload: object,
    type: TokenType,
    expiresIn: string = this.defaultExpiresIn,
  ): string {
    try {
      this.log.debug("Signing token", { type, expiresIn });
      const payloadWithType = { ...payload, type };
      return jwt.sign(payloadWithType, this.secrets[type], {
        expiresIn: expiresIn as SignOptions["expiresIn"],
      });
    } catch (error) {
      this.log.error("Error generating token", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InvalidTokenError("Failed to sign token", {
        cause: error,
      });
    }
  }

  verifyToken<T = object>(token: string, type: TokenType): T {
    try {
      const decoded = jwt.verify(token, this.secrets[type]);
      if (typeof decoded === "string" || (decoded as { type?: string }).type !== type) {
        this.log.warn("Token payload type mismatch", { type });
        throw new InvalidTokenError("Token payload invalid");
      }
      this.log.debug("Token verified successfully", { type });
      return decoded as T;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        this.log.warn("Token expired", { expiredAt: error.expiredAt?.toISOString?.() });
        throw new ExpiredTokenError(undefined, { cause: error });
      }
      if (error instanceof JsonWebTokenError) {
        this.log.warn("Invalid token", { reason: error.message });
        throw new InvalidTokenError(undefined, { cause: error });
      }
      this.log.error("Unexpected token verification error", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
