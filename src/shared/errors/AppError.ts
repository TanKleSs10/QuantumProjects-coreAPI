/**
 * Standard application error used to convey domain or application issues.
 */
export class AppError extends Error {
  constructor(message: string, public readonly statusCode = 500, public readonly details?: unknown) {
    super(message);
    this.name = 'AppError';
  }
}
