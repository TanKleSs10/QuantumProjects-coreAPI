import { ILogger, LogLevel, LogMetadata } from "@src/interfaces/Logger";
import { WinstonLogger } from "./WinstonLogger";

export const createLogger = (scope?: string): ILogger => {
  return new WinstonLogger({ scope });
};
