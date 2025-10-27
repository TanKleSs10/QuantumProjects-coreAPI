import { envs } from "@src/config/envs";
import { ILogger, LogLevel, LogMetadata } from "@src/interfaces/Logger";
import winston from "winston";
import LokiTransport from "winston-loki";

interface WinstonLoggerOptions {
  scope?: string;
}

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;
  private readonly host = envs.LOKI_HOST;
  private readonly environment = envs.ENVIRONMENT || "development";
  private readonly scope: string;

  constructor(options: WinstonLoggerOptions = {}) {
    this.scope = options.scope || "default";

    const jsonFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    );

    this.logger = winston.createLogger({
      level: "debug",
      format: jsonFormat,
      transports: [
        new LokiTransport({
          host: this.host,
          json: true,
          labels: {
            app: "quantum-projects",
            environment: this.environment,
            scope: this.scope, // usa el scope actual como label fijo
          },
          batching: true,
          interval: 5,
          clearOnError: true,
          replaceTimestamp: true,
        }),
        new winston.transports.Console(),
      ],
    });
  }

  private buildMeta(level: LogLevel, metadata?: LogMetadata) {
    return {
      level,
      scope: this.scope,
      environment: this.environment,
      timestamp: new Date().toISOString(),
      ...(metadata || {}),
    };
  }

  log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    this.logger.log(level, { message, ...this.buildMeta(level, metadata) });
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log("warn", message, metadata);
  }

  error(message: string | Error, metadata?: LogMetadata): void {
    if (message instanceof Error) {
      this.log("error", message.message, { stack: message.stack, ...metadata });
    } else {
      this.log("error", message, metadata);
    }
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log("debug", message, metadata);
  }

  child(scope: string): ILogger {
    // crea un nuevo logger con su propio scope
    return new WinstonLogger({ scope });
  }

  getLevel(): LogLevel {
    return this.logger.level as LogLevel;
  }
}
