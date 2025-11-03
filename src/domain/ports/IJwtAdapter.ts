export interface IJwtAdapter {
  sign(payload: object, expiresIn?: string): string;
  verify<T = object>(token: string): T | null;
}
