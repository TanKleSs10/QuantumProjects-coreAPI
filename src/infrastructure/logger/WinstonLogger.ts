import winston from 'winston';
import { LoggerPort } from '../../core/interfaces/LoggerPort';

/**
 * Winston-based logger implementing the LoggerPort contract.
 */
export class WinstonLogger implements LoggerPort {
  private readonly logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [new winston.transports.Console()],
  });

  info(message: string, metadata: Record<string, unknown> = {}): void {
    this.logger.info(message, metadata);
  }

  error(message: string, metadata: Record<string, unknown> = {}): void {
    this.logger.error(message, metadata);
  }

  warn(message: string, metadata: Record<string, unknown> = {}): void {
    this.logger.warn(message, metadata);
  }

  debug(message: string, metadata: Record<string, unknown> = {}): void {
    this.logger.debug(message, metadata);
  }
}
