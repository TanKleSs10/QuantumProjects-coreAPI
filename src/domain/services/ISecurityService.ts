export interface ISecurityService {
  // 🔒 Hash y verificación de contraseñas
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;

  // 🔑 Manejo de tokens JWT
  generateToken(payload: object, expiresIn?: string): Promise<string>;
  verifyToken<T = object>(token: string): Promise<T | null>;
}
