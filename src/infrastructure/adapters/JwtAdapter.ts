import { IJwtAdapter } from "@src/domain/ports/IJwtAdapter";
import jwt from "jsonwebtoken";

export class JwtAdapter implements IJwtAdapter {
  private readonly secret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }
    this.secret = secret;
  }

  sign(payload: object, expiresIn?: string): string {
    try {
      // TypeScript has strict typing for expiresIn, using any to bypass
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return jwt.sign(payload, this.secret, expiresIn ? { expiresIn: expiresIn as any } : {});
    } catch (error) {
      throw new Error(
        `JWT signing failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  verify<T = object>(token: string): T | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      return decoded as T;
    } catch (error) {
      return null;
    }
  }
}
