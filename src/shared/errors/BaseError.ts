/**
 * Represents the options that can be provided when constructing a {@link BaseError}.
 */
export interface BaseErrorOptions {
  /**
   * Underlying cause of the error, typically another {@link Error} instance.
   */
  readonly cause?: unknown;
}

/**
 * Base class for all custom errors in the Quantum Projects backend.
 *
 * This class extends the native {@link Error} to incorporate additional metadata
 * that is shared across all layers of the application. Specific error types for
 * each architectural layer must extend this class instead of inheriting directly
 * from {@link Error}.
 */
export abstract class BaseError extends Error {
  /** Timestamp indicating when the error was instantiated. */
  public readonly timestamp: Date;

  /** Optional underlying cause of the error. */
  public readonly cause?: unknown;

  protected constructor(name: string, message: string, options?: BaseErrorOptions) {
    super(message);

    this.name = name;
    this.timestamp = new Date();
    this.cause = options?.cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
