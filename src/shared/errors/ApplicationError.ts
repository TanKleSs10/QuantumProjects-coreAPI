import { BaseError, BaseErrorOptions } from "./BaseError";

/**
 * Error type for failures that occur in the application (use-case) layer.
 *
 * Use cases should throw this error whenever an orchestration or business
 * workflow cannot be completed successfully, delegating logging to the
 * presentation layer.
 */
export class ApplicationError extends BaseError {
  constructor(message: string, options?: BaseErrorOptions) {
    super("ApplicationError", message, options);
  }
}
