export interface ITokenAdapter {
  generateToken(payload: object, expiresIn?: string): string;
  verifyToken<T = object>(token: string): T;
}
