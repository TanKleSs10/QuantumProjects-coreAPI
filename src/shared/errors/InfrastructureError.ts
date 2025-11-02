import { BaseError, BaseErrorOptions } from "./BaseError";

/**
 * Error type representing failures that originate from the infrastructure layer.
 *
 * Typical scenarios include data-source communication issues, database errors
 * or configuration problems. Infrastructure components must throw instances of
 * this class so the upper layers can react accordingly without performing
 * logging at this level.
 */
export class InfrastructureError extends BaseError {
  constructor(message: string, options?: BaseErrorOptions) {
    super("InfrastructureError", message, options);
  }
}
