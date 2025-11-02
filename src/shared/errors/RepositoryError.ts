import { BaseError, BaseErrorOptions } from "./BaseError";

/**
 * Error type representing issues occurring within repository implementations.
 *
 * Repositories should throw this error when they cannot fulfill a data access
 * contract with the domain layer due to validation problems, mapping issues or
 * unexpected infrastructure responses.
 */
export class RepositoryError extends BaseError {
  constructor(message: string, options?: BaseErrorOptions) {
    super("RepositoryError", message, options);
  }
}
