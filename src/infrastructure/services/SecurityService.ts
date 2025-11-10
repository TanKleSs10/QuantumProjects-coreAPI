import { ISecurityAdapter } from "@src/domain/ports/ISecurityAdapter";
import { ITokenAdapter } from "@src/domain/ports/ITokenAdapter";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { logger } from "@src/infrastructure/logs";

export class SecurityService implements ISecurityService {
  private readonly log = logger.child("SecurityService");

  constructor(
    private securityAdapter: ISecurityAdapter,
    private tokenAdapter: ITokenAdapter,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return this.securityAdapter.hashPassword(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.securityAdapter.verifyPassword(password, hash);
  }

  async generateToken(payload: object, expiresIn?: string): Promise<string> {
    this.log.debug("Generating token", { hasCustomExpiry: Boolean(expiresIn) });
    return this.tokenAdapter.generateToken(payload, expiresIn);
  }

  async verifyToken<T = object>(token: string): Promise<T | null> {
    this.log.debug("Verifying token");
    try {
      return this.tokenAdapter.verifyToken<T>(token);
    } catch (error) {
      this.log.error("Token verification failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
