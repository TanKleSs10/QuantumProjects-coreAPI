type Attempt = {
  count: number;
  lockedUntil?: number;
};

export class LockoutService {
  private readonly attempts = new Map<string, Attempt>();

  constructor(
    private readonly maxAttempts = 5,
    private readonly lockMs = 15 * 60 * 1000,
  ) {}

  isLocked(key: string): boolean {
    const entry = this.attempts.get(key);
    return Boolean(entry?.lockedUntil && entry.lockedUntil > Date.now());
  }

  registerFail(key: string): void {
    const now = Date.now();
    const entry = this.attempts.get(key) ?? { count: 0 };

    if (entry.lockedUntil && entry.lockedUntil > now) {
      return;
    }

    entry.count += 1;

    if (entry.count >= this.maxAttempts) {
      entry.lockedUntil = now + this.lockMs;
      entry.count = 0;
    }

    this.attempts.set(key, entry);
  }

  clear(key: string): void {
    this.attempts.delete(key);
  }
}
