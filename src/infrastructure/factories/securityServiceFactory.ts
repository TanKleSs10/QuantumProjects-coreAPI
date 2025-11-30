import { ScryptSecurityAdapter } from "@src/infrastructure/adapters/ScryptSecurityAdapter";
import { JWTAdapter } from "@src/infrastructure/adapters/JWTAdapter";
import { SecurityService } from "@src/infrastructure/services/SecurityService";
import { ISecurityService } from "@src/domain/services/ISecurityService";

const securityAdapter = new ScryptSecurityAdapter();
const tokenAdapter = new JWTAdapter();

export const securityService: ISecurityService = new SecurityService(
  securityAdapter,
  tokenAdapter,
);
