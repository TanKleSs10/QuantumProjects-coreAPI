import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

let nativeBcrypt: typeof import("bcrypt") | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  nativeBcrypt = require("bcrypt");
} catch {
  nativeBcrypt = null;
}

const FALLBACK_SALT_LENGTH = 16;
const FALLBACK_KEY_LENGTH = 64;

/**
 * Hashes a password using bcrypt when available, otherwise falls back to scrypt.
 */
export async function hashPassword(password: string, saltRounds: number): Promise<string> {
  if (nativeBcrypt) {
    return nativeBcrypt.hash(password, saltRounds);
  }

  const salt = randomBytes(FALLBACK_SALT_LENGTH).toString("hex");
  const derivedKey = scryptSync(password, salt, FALLBACK_KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

/**
 * Compares a plain password against a hash using bcrypt when possible.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (nativeBcrypt) {
    return nativeBcrypt.compare(password, hash);
  }

  if (!hash.startsWith("scrypt$")) {
    return false;
  }

  const [, salt, stored] = hash.split("$");
  const derivedKey = scryptSync(password, salt, FALLBACK_KEY_LENGTH);
  const storedBuffer = Buffer.from(stored, "hex");
  return storedBuffer.length === derivedKey.length && timingSafeEqual(derivedKey, storedBuffer);
}
