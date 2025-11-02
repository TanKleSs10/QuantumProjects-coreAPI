/**
 * Abstraction over logging capabilities to keep domain decoupled
 * from specific logging libraries.
 */
export interface LoggerPort {
  info(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
}
