import { envs } from "@src/config/envs";
import { ILogger, LogLevel, LogMetadata } from "@src/interfaces/Logger";
import winston from "winston";
import LokiTransport from "winston-loki";

interface WinstonLoggerOptions {
  scope?: string;
}

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;
  private readonly host = envs.HOST;
  private readonly environment = envs.ENVIRONMENT;

  constructor(options: WinstonLoggerOptions) {
    this.logger = winston.createLogger({
      level: "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new LokiTransport({
          host: this.host,
          labels: {
            app: "quantum-projects",
            environment: this.environment,
            scope: options.scope || "default",
          },
          batching: true,
          interval: 5,
          clearOnError: true,
          replaceTimestamp: true,
        }),
      ],
    });
  }

  log(level: LogLevel, message: string, metadata: LogMetadata): void {
    this.logger.log(level, message, metadata);
  }

  info(message: string, metadata: LogMetadata): void {
    this.logger.info(message, metadata);
  }

  warn(message: string, metadata: LogMetadata): void {
    this.logger.warn(message, metadata);
  }

  error(message: string | Error, metadata?: LogMetadata): void {
    if (message instanceof Error) {
      this.logger.error(message.message, {
        stack: message.stack,
        ...metadata,
      });
      return;
    }
    this.logger.error(message, metadata);
  }

  debug(message: string, metadata: LogMetadata): void {
    this.logger.debug(message, metadata);
  }

  child(scope: string): ILogger {
    return new WinstonLogger({ scope });
  }

  getLevel(): LogLevel {
    return this.logger.level as LogLevel;
  }
}
