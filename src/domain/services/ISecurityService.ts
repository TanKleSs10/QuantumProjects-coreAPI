export interface ISecurityService {
  // 🔒 Hash y verificación de contraseñas
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
