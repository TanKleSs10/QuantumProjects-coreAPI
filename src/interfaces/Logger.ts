/**
 * Log levels supported by the application level logger.
 */
export type LogLevel = "error" | "warn" | "info" | "debug";

/**
 * Metadata object that can be attached to every log message.
 */
export type LogMetadata = Record<string, unknown>;

/**
 * Abstraction that defines the contract for loggers used across the
 * application. The interface intentionally hides any dependency on
 * a particular logging library so that the domain and application layers
 * do not depend on infrastructure details.
 */
export interface ILogger {
  /**
   * Logs a message using the provided level.
   */
  log(level: LogLevel, message: string, metadata?: LogMetadata): void;

  /**
   * Logs informational messages useful to describe the application flow.
   */
  info(message: string, metadata?: LogMetadata): void;

  /**
   * Logs warnings that may require attention but are not errors yet.
   */
  warn(message: string, metadata?: LogMetadata): void;

  /**
   * Logs errors along with optional context metadata.
   */
  error(message: string | Error, metadata?: LogMetadata): void;

  /**
   * Logs verbose debugging information.
   */
  debug(message: string, metadata?: LogMetadata): void;

  /**
   * Creates a contextualised logger that automatically adds the provided
   * scope to all log entries. This allows infrastructure components such
   * as HTTP middlewares to report their own identity without sharing state.
   */
  child(scope: string): ILogger;

  /**
   * Retrieves the current log level used by the logger implementation.
   */
  getLevel(): LogLevel;
}
