import { BaseError, BaseErrorOptions } from "./BaseError";

/**
 * Error type representing HTTP-specific failures handled by controllers or
 * global middleware.
 *
 * It allows attaching an HTTP status code so the presentation layer can build
 * consistent responses while centralizing logging responsibilities.
 */
export class HttpError extends BaseError {
  /** HTTP status code associated with the error. */
  public readonly statusCode: number;

  constructor(message: string, statusCode: number, options?: BaseErrorOptions) {
    super("HttpError", message, options);
    this.statusCode = statusCode;
  }
}
