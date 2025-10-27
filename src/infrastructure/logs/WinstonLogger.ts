import { envs } from "@src/config/envs";
import { ILogger, LogLevel, LogMetadata } from "@src/interfaces/Logger";
import winston from "winston";
import LokiTransport from "winston-loki";

interface WinstonLoggerOptions {
  scope?: string;
}

const SERVICE_LABEL = "quantum-projects-api";
const RESERVED_META_KEYS = new Set(["level", "message", "timestamp", "environment", "scope", "app"]);

export class WinstonLogger implements ILogger {
  private readonly logger: winston.Logger;
  private readonly host = envs.LOKI_HOST;
  private readonly environment = envs.ENVIRONMENT ?? "development";
  private readonly scope: string;

  constructor(options: WinstonLoggerOptions = {}) {
    this.scope = options.scope ?? "app";

    this.logger = winston.createLogger({
      level: "debug",
      format: this.createJsonFormat(),
      transports: this.createTransports(),
      exitOnError: false,
    });
  }

  private createJsonFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    );
  }

  private createTransports(): winston.transport[] {
    const transports: winston.transport[] = [];
    const consoleTransport = new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, scope, ...rest }) => {
          const metadata = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : "";
          return `${timestamp} [${scope ?? this.scope}] ${level}: ${message}${metadata}`;
        }),
      ),
    });

    if (this.environment === "development") {
      transports.push(consoleTransport);
      return transports;
    }

    const lokiTransport = new LokiTransport({
      host: this.host,
      json: true,
      batching: true,
      interval: 5,
      replaceTimestamp: true,
      labels: {
        app: SERVICE_LABEL,
        environment: this.environment,
        scope: this.scope,
      },
    });

    lokiTransport.on("error", (error: unknown) => {
      const normalized =
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : { message: String(error) };

      const fallbackEntry = {
        timestamp: new Date().toISOString(),
        level: "error",
        scope: `${this.scope}:loki`,
        message: "Failed to push logs to Loki",
        error: normalized,
      };

      console.error(JSON.stringify(fallbackEntry));
    });

    transports.push(lokiTransport, consoleTransport);
    return transports;
  }

  private sanitizeMetadata(metadata?: LogMetadata): LogMetadata {
    if (!metadata) return {};

    return Object.entries(metadata).reduce<LogMetadata>((acc, [key, value]) => {
      if (RESERVED_META_KEYS.has(key)) {
        return acc;
      }

      acc[key] = this.serializeValue(value);
      return acc;
    }, {});
  }

  private serializeValue(value: unknown): unknown {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serializeValue(item));
    }

    if (typeof value === "bigint") {
      return value.toString();
    }

    if (typeof value === "function") {
      return value.name || "anonymous";
    }

    if (typeof value === "symbol") {
      return value.toString();
    }

    if (typeof value === "object" && value !== null) {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return {
          type: value.constructor ? value.constructor.name : "Object",
          summary: "[unserializable]",
        };
      }
    }

    return value;
  }

  private buildEntry(level: LogLevel, message: string, metadata?: LogMetadata): winston.LogEntry {
    const meta = this.sanitizeMetadata(metadata);

    return {
      level,
      message,
      app: SERVICE_LABEL,
      environment: this.environment,
      scope: this.scope,
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

  log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    this.logger.log(this.buildEntry(level, message, metadata));
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log("warn", message, metadata);
  }

  error(message: string | Error, metadata?: LogMetadata): void {
    if (message instanceof Error) {
      const errorMeta: LogMetadata = {
        error: this.serializeValue(message),
        ...metadata,
      };

      this.log("error", message.message, errorMeta);
      return;
    }

    this.log("error", message, metadata);
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log("debug", message, metadata);
  }

  child(scope: string): ILogger {
    const childScope = [this.scope, scope].filter(Boolean).join(":");
    return new WinstonLogger({ scope: childScope });
  }

  getLevel(): LogLevel {
    return this.logger.level as LogLevel;
  }
}
