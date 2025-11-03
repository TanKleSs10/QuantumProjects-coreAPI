import { ISecurityAdapter } from "@src/domain/ports/ISecurityAdapter";
import { randomBytes, timingSafeEqual, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class ScryptSecurityAdapter implements ISecurityAdapter {
  private readonly keylen = 64;
  private readonly salts = 16;

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(this.salts);
    const derivedKey = (await scryptAsync(
      password,
      salt,
      this.keylen,
    )) as Buffer;
    return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [saltHex, keyHex] = hash.split(":");
    const salt = Buffer.from(saltHex, "hex");
    const key = Buffer.from(keyHex, "hex");
    const derivedKey = (await scryptAsync(
      password,
      salt,
      key.length,
    )) as Buffer;
    return timingSafeEqual(key, derivedKey);
  }
}
