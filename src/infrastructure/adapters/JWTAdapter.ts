import jwt, { JsonWebTokenError, TokenExpiredError, SignOptions } from "jsonwebtoken";

import { ITokenAdapter } from "@src/domain/ports/ITokenAdapter";
import { envs } from "@src/config/envs";
import { logger } from "@src/infrastructure/logs";
import { InvalidTokenError } from "@src/shared/errors/InvalidTokenError";
import { ExpiredTokenError } from "@src/shared/errors/ExpiredTokenError";

export class JWTAdapter implements ITokenAdapter {
  private readonly secret = envs.JWT_SECRET;
  private readonly defaultExpiresIn = envs.JWT_EXPIRES_IN;
  private readonly log = logger.child("JWTAdapter");

  generateToken(payload: object, expiresIn: string = this.defaultExpiresIn): string {
    try {
      this.log.debug("Signing token", { expiresIn });
      return jwt.sign(payload, this.secret, {
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

  verifyToken<T = object>(token: string): T {
    try {
      const decoded = jwt.verify(token, this.secret);
      this.log.debug("Token verified successfully");
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
