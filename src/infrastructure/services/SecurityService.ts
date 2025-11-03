import { IJwtAdapter } from "@src/domain/ports/IJwtAdapter";
import { ISecurityAdapter } from "@src/domain/ports/ISecurityAdapter";
import { ISecurityService } from "@src/domain/services/ISecurityService";

export class SecurityService implements ISecurityService {
  constructor(
    private securityAdapter: ISecurityAdapter,
    private jwtAdapter: IJwtAdapter,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return this.securityAdapter.hashPassword(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.securityAdapter.verifyPassword(password, hash);
  }

  async generateToken(payload: object, expiresIn?: string): Promise<string> {
    return this.jwtAdapter.sign(payload, expiresIn);
  }

  async verifyToken<T = object>(token: string): Promise<T | null> {
    return this.jwtAdapter.verify<T>(token);
  }
}
