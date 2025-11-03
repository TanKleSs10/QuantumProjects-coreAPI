import { ISecurityAdapter } from "@src/domain/ports/ISecurityAdapter";
import { ISecurityService } from "@src/domain/services/ISecurityService";

export class SecurityService implements ISecurityService {
  constructor(private securityAdapter: ISecurityAdapter) {}

  async hashPassword(password: string): Promise<string> {
    return this.securityAdapter.hashPassword(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.securityAdapter.verifyPassword(password, hash);
  }
}
