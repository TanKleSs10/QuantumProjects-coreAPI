import { BaseError, BaseErrorOptions } from "./BaseError";

/**
 * Error type for issues related to domain rules, invariants or entities.
 *
 * Domain services and aggregates should throw this error to indicate that a
 * business invariant has been violated or an entity is in an invalid state.
 */
export class DomainError extends BaseError {
  constructor(message: string, options?: BaseErrorOptions) {
    super("DomainError", message, options);
  }
}
