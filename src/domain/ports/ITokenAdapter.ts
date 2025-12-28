import { TokenType } from "@src/types/tokenType";

export interface ITokenAdapter {
  generateToken(payload: object, type: TokenType, expiresIn?: string): string;
  verifyToken<T = object>(token: string, type: TokenType): T;
}
